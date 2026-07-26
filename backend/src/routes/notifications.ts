import { Router } from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  clearNotifications,
} from '../controllers/notificationController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All notification routes are protected
router.use(authenticate);

// GET /api/notifications
router.get('/', getNotifications);

// PATCH /api/notifications/read-all
router.patch('/read-all', markAllAsRead);

// PATCH /api/notifications/:id/read
router.patch('/:id/read', markAsRead);

// DELETE /api/notifications
router.delete('/', clearNotifications);

export default router;
