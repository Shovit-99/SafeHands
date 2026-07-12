import { Request, Response } from 'express';
import User from '../models/User';
import { signToken } from '../utils/jwt';
import { JwtPayload } from '../types';

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

    const payload: JwtPayload = {
      id: String(user._id),
      email: user.email,
      role: user.role,
    };

    const token = signToken(payload);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
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

    const token = signToken(payload);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
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
