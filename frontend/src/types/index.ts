// ─── Auth Types ───────────────────────────────────────────────────────────────
export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
  requires2FA?: boolean;
  requires2FASetup?: boolean;
  tempToken?: string;
  qrCodeUrl?: string;
  secret?: string;
}

// ─── Item Types ───────────────────────────────────────────────────────────────
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

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Item {
  _id: string;
  title: string;
  description: string;
  category: ItemCategory;
  status: ItemStatus;
  locationName: string;
  coordinates: Coordinates;
  images: string[];
  reporterId: { _id: string; name: string; email: string };
  claimedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ItemsResponse {
  success: boolean;
  data: Item[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

// ─── Message Types ────────────────────────────────────────────────────────────
export interface Message {
  _id: string;
  chatId: string;
  senderId: string;
  receiverId: string;
  messageText: string;
  read: boolean;
  timestamp: string;
  createdAt: string;
}

// ─── API Response Types ───────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

// ─── Filter Types ─────────────────────────────────────────────────────────────
export interface ItemFilters {
  q?: string;
  category?: ItemCategory | '';
  status?: ItemStatus | '';
  page?: number;
  limit?: number;
}
