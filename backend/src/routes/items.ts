import { Router } from 'express';
import {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  getMyItems,
} from '../controllers/itemController';
import { authenticate, authorize } from '../middleware/auth';
import { upload } from '../utils/upload';
import { validateCreateItem, validateUpdateItem } from '../middleware/requestValidators';

const router = Router();

// GET  /api/items         — Public
router.get('/', getItems);

// GET  /api/items/mine    — Authenticated (own items — must be before /:id)
router.get('/mine', authenticate, getMyItems);

// GET  /api/items/:id     — Public
router.get('/:id', getItemById);

// POST /api/items         — Authenticated (any role)
router.post(
  '/',
  authenticate,
  upload.array('images', 5),
  validateCreateItem,
  createItem
);

// PATCH /api/items/:id   — Authenticated (owner or admin)
router.patch('/:id', authenticate, validateUpdateItem, updateItem);

// DELETE /api/items/:id  — Admin only
router.delete('/:id', authenticate, authorize('admin'), deleteItem);

export default router;
