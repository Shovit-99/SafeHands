import { Request, Response } from 'express';
import User from '../models/User';
import { signToken, verifyToken } from '../utils/jwt';
import { JwtPayload } from '../types';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import jwt from 'jsonwebtoken';

// ─── Register ─────────────────────────────────────────────────────────────────
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body as {
      name: string;
      email: string;
      password: string;
      role?: 'student' | 'admin';
    };

    // Prevent arbitrary admin self-assignment
    const safeRole = role === 'admin' ? 'student' : (role ?? 'student');

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
      return;
    }

    const user = await User.create({ name, email, password, role: safeRole });

    const secret = speakeasy.generateSecret({
      name: `SafeHands (${user.email})`,
    });
    user.twoFactorSecret = secret.base32;
    await user.save();

    const dataURL = await qrcode.toDataURL(secret.otpauth_url || '');

    const tempToken = jwt.sign(
      { id: String(user._id), email: user.email, isTemp: true },
      process.env.JWT_SECRET as string,
      { expiresIn: '15m' }
    );

    res.status(201).json({
      success: true,
      message: 'Account created. Please setup 2FA.',
      requires2FASetup: true,
      tempToken,
      qrCodeUrl: dataURL,
      secret: secret.base32,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Registration failed.';
    res.status(500).json({ success: false, message });
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    if (!email || !password) {
      res
        .status(400)
        .json({ success: false, message: 'Email and password are required.' });
      return;
    }

    // Re-include password field (excluded by default)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res
        .status(401)
        .json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res
        .status(401)
        .json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const payload: JwtPayload = {
      id: String(user._id),
      email: user.email,
      role: user.role,
    };

    // If 2FA is enabled, require standard 2FA login
    if (user.isTwoFactorEnabled) {
      const tempToken = jwt.sign(
        { id: String(user._id), email: user.email, isTemp: true },
        process.env.JWT_SECRET as string,
        { expiresIn: '5m' }
      );
      res.status(200).json({
        success: true,
        message: '2FA required.',
        requires2FA: true,
        tempToken,
      });
      return;
    }

    // If 2FA is NOT enabled, enforce setup
    const secret = speakeasy.generateSecret({
      name: `SafeHands (${user.email})`,
    });
    user.twoFactorSecret = secret.base32;
    await user.save();

    const dataURL = await qrcode.toDataURL(secret.otpauth_url || '');

    const tempToken = jwt.sign(
      { id: String(user._id), email: user.email, isTemp: true },
      process.env.JWT_SECRET as string,
      { expiresIn: '15m' }
    );

    res.status(200).json({
      success: true,
      message: '2FA setup required.',
      requires2FASetup: true,
      tempToken,
      qrCodeUrl: dataURL,
      secret: secret.base32,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed.';
    res.status(500).json({ success: false, message });
  }
};

// ─── Get Current User ─────────────────────────────────────────────────────────
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch user.' });
  }
};

// ─── Update Profile ─────────────────────────────────────────────────────────────
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body as { name: string };
    
    if (!name || name.trim().length < 2) {
      res.status(400).json({ success: false, message: 'Name must be at least 2 characters.' });
      return;
    }

    const user = await User.findByIdAndUpdate(
      req.user?.id,
      { name: name.trim() },
      { new: true, runValidators: true }
    );

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};

// ─── Update Password ──────────────────────────────────────────────────────────
export const updatePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || newPassword.length < 8) {
      res.status(400).json({ success: false, message: 'New password must be at least 8 characters.' });
      return;
    }

    const user = await User.findById(req.user?.id).select('+password');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Incorrect current password.' });
      return;
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update password.' });
  }
};

// ─── 2FA: Generate Secret & QR Code ──────────────────────────────────────────
export const generate2FA = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const secret = speakeasy.generateSecret({
      name: `SafeHands (${user.email})`,
    });

    user.twoFactorSecret = secret.base32;
    await user.save();

    const dataURL = await qrcode.toDataURL(secret.otpauth_url || '');

    res.status(200).json({
      success: true,
      qrCodeUrl: dataURL,
      secret: secret.base32,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate 2FA secret.' });
  }
};

// ─── 2FA: Verify Token and Enable ─────────────────────────────────────────────
export const verify2FA = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body as { token: string };
    const user = await User.findById(req.user?.id).select('+twoFactorSecret');
    if (!user || !user.twoFactorSecret) {
      res.status(400).json({ success: false, message: '2FA secret not found. Generate first.' });
      return;
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
    });

    if (verified) {
      user.isTwoFactorEnabled = true;
      await user.save();
      res.status(200).json({ success: true, message: '2FA enabled successfully.' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid 2FA token.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to verify 2FA token.' });
  }
};

// ─── 2FA: Login with Token ───────────────────────────────────────────────────
export const login2FA = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tempToken, token } = req.body as { tempToken: string; token: string };
    if (!tempToken || !token) {
      res.status(400).json({ success: false, message: 'Temp token and 2FA token required.' });
      return;
    }

    let decoded: any;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET as string);
    } catch (err) {
      res.status(401).json({ success: false, message: 'Invalid or expired temp token.' });
      return;
    }

    if (!decoded.isTemp) {
      res.status(401).json({ success: false, message: 'Invalid token type.' });
      return;
    }

    const user = await User.findById(decoded.id).select('+twoFactorSecret');
    if (!user || !user.twoFactorSecret) {
      res.status(401).json({ success: false, message: 'User not found or 2FA not enabled.' });
      return;
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
    });

    if (!verified) {
      res.status(401).json({ success: false, message: 'Invalid 2FA code.' });
      return;
    }

    const payload: JwtPayload = {
      id: String(user._id),
      email: user.email,
      role: user.role,
    };

    const finalToken = signToken(payload);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token: finalToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to login with 2FA.' });
  }
};

// ─── 2FA: Setup with Temp Token ──────────────────────────────────────────────
export const setup2FA = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tempToken, token } = req.body as { tempToken: string; token: string };
    if (!tempToken || !token) {
      res.status(400).json({ success: false, message: 'Temp token and 2FA code required.' });
      return;
    }

    let decoded: any;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET as string);
    } catch (err) {
      res.status(401).json({ success: false, message: 'Invalid or expired temp token.' });
      return;
    }

    if (!decoded.isTemp) {
      res.status(401).json({ success: false, message: 'Invalid token type.' });
      return;
    }

    const user = await User.findById(decoded.id).select('+twoFactorSecret');
    if (!user || !user.twoFactorSecret) {
      res.status(401).json({ success: false, message: 'User not found or secret not generated.' });
      return;
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
    });

    if (!verified) {
      res.status(400).json({ success: false, message: 'Invalid 2FA code.' });
      return;
    }

    user.isTwoFactorEnabled = true;
    await user.save();

    const payload: JwtPayload = {
      id: String(user._id),
      email: user.email,
      role: user.role,
    };

    const finalToken = signToken(payload);

    res.status(200).json({
      success: true,
      message: '2FA setup successful.',
      token: finalToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to setup 2FA.' });
  }
};
