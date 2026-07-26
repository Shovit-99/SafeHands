import api from './axios';
import type { User } from '../types';

export const updateProfile = async (name: string): Promise<User> => {
  const { data } = await api.patch<{ success: boolean; user: User; message: string }>('/auth/profile', { name });
  return data.user;
};

export const updatePassword = async (currentPassword: string, newPassword: string): Promise<string> => {
  const { data } = await api.patch<{ success: boolean; message: string }>('/auth/password', { currentPassword, newPassword });
  return data.message;
};
