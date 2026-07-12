import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be defined in environment variables');
}

// ─── Sign Token ───────────────────────────────────────────────────────────────
export const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
};

// ─── Verify Token ─────────────────────────────────────────────────────────────
export const verifyToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired. Please log in again.');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token. Please log in again.');
    }
    throw new Error('Token verification failed.');
  }
};

// ─── Build Chat ID (deterministic, order-independent) ─────────────────────────
export const buildChatId = (userAId: string, userBId: string): string => {
  return [userAId, userBId].sort().join('_');
};
