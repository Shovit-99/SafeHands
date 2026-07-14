import api from './axios';
import type { AuthResponse, User } from '../types';

// ─── Register ─────────────────────────────────────────────────────────────────
export const registerUser = async (
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>('/auth/register', {
    name,
    email,
    password,
  });
  return data;
};

// ─── Login ────────────────────────────────────────────────────────────────────
export const loginUser = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>('/auth/login', {
    email,
    password,
  });
  return data;
};

// ─── Get Current User ─────────────────────────────────────────────────────────
export const getMe = async (): Promise<User> => {
  const { data } = await api.get<{ success: boolean; user: User }>('/auth/me');
  return data.user;
};
