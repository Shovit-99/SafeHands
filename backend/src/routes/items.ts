import { Router } from 'express';
import {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
} from '../controllers/itemController';
import { authenticate, authorize } from '../middleware/auth';
import { upload } from '../utils/upload';

const router = Router();

// GET  /api/items         — Public
router.get('/', getItems);

// GET  /api/items/:id     — Public
router.get('/:id', getItemById);

// POST /api/items         — Authenticated (any role)
router.post(
  '/',
  authenticate,
  upload.array('images', 5),
  createItem
);

// PATCH /api/items/:id   — Authenticated (owner or admin)
router.patch('/:id', authenticate, updateItem);

// DELETE /api/items/:id  — Admin only
router.delete('/:id', authenticate, authorize('admin'), deleteItem);

export default router;
