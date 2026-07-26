import { Document } from 'mongoose';

// ─── User Interfaces ─────────────────────────────────────────────────────────

export type UserRole = 'student' | 'admin';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  twoFactorSecret?: string;
  isTwoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// ─── Item Interfaces ──────────────────────────────────────────────────────────

export type ItemStatus = 'Lost' | 'Found' | 'Claimed';

export type ItemCategory =
  | 'Electronics'
  | 'Clothing'
  | 'Accessories'
  | 'Books'
  | 'ID & Cards'
  | 'Keys'
  | 'Bags'
  | 'Sports'
  | 'Other';

export interface ICoordinates {
  lat: number;
  lng: number;
}

export interface IItem extends Document {
  title: string;
  description: string;
  category: ItemCategory;
  status: ItemStatus;
  locationName: string;
  coordinates: ICoordinates;
  images: string[];
  reporterId: IUser['_id'];
  claimedBy?: IUser['_id'];
  claimToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Message / Chat Interfaces ────────────────────────────────────────────────

export interface IMessage extends Document {
  chatId: string;
  senderId: IUser['_id'];
  receiverId: IUser['_id'];
  messageText: string;
  read: boolean;
  timestamp: Date;
}

// ─── Auth Token Payload ───────────────────────────────────────────────────────

export interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
}

// ─── Express Request Augmentation ────────────────────────────────────────────

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
