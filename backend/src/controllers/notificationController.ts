import { Request, Response } from 'express';
import Notification from '../models/Notification';

// ─── Get Notifications ────────────────────────────────────────────────────────
export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const notifications = await Notification.find({ recipientId: req.user?.id })
      .populate('senderId', 'name')
      .sort({ createdAt: -1 })
      .limit(50); // Keep it reasonable

    res.status(200).json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
  }
};

// ─── Mark Notification as Read ────────────────────────────────────────────────
export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipientId: req.user?.id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      res.status(404).json({ success: false, message: 'Notification not found.' });
      return;
    }

    res.status(200).json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to mark notification as read.' });
  }
};

// ─── Mark All Notifications as Read ───────────────────────────────────────────
export const markAllAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    await Notification.updateMany(
      { recipientId: req.user?.id, read: false },
      { read: true }
    );

    res.status(200).json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to mark all as read.' });
  }
};

// ─── Clear All Notifications ──────────────────────────────────────────────────
export const clearNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    await Notification.deleteMany({ recipientId: req.user?.id });
    res.status(200).json({ success: true, message: 'All notifications cleared.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to clear notifications.' });
  }
};
