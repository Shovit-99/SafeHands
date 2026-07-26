import api from './axios';

export interface AppNotification {
  _id: string;
  recipientId: string;
  senderId?: { _id: string; name: string };
  type: 'message' | 'system' | 'alert';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export const fetchNotifications = async (): Promise<AppNotification[]> => {
  const { data } = await api.get<{ success: boolean; notifications: AppNotification[] }>('/notifications');
  return data.notifications;
};

export const markNotificationAsRead = async (id: string): Promise<AppNotification> => {
  const { data } = await api.patch<{ success: boolean; notification: AppNotification }>(`/notifications/${id}/read`);
  return data.notification;
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  await api.patch('/notifications/read-all');
};

export const clearNotifications = async (): Promise<void> => {
  await api.delete('/notifications');
};
