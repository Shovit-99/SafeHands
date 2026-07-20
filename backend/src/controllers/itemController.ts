import { Request, Response } from 'express';
import Item from '../models/Item';
import { ItemStatus, ItemCategory } from '../types';

// ─── Create Item ──────────────────────────────────────────────────────────────
export const createItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { title, description, category, status, locationName, coordinates } =
      req.body as {
        title: string;
        description: string;
        category: ItemCategory;
        status?: ItemStatus;
        locationName: string;
        coordinates: { lat: number; lng: number };
      };

    // Cloudinary storage gives `f.path` (the Cloudinary URL).
    // Memory storage gives no path — images are not persisted in that case.
    const images: string[] = (req.files as Array<Express.Multer.File & { path?: string }>)
      ?.map((f) => f.path ?? '')
      .filter(Boolean) ?? [];

    const item = await Item.create({
      title,
      description,
      category,
      status: status ?? 'Lost',
      locationName,
      coordinates,
      images,
      reporterId: req.user!.id,
    });

    res.status(201).json({ success: true, item });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to create item.';
    res.status(500).json({ success: false, message });
  }
};

// ─── Get All Items (with filters) ────────────────────────────────────────────
export const getItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      q,
      category,
      status,
      page = '1',
      limit = '12',
    } = req.query as {
      q?: string;
      category?: string;
      status?: string;
      page?: string;
      limit?: string;
    };

    const filter: Record<string, unknown> = {};

    // Full-text search (falls back to regex if text index not yet built)
    if (q && q.trim()) {
      filter.$text = { $search: q.trim() };
    }

    if (category) filter.category = category;
    if (status) filter.status = status;

    const pageNum = Math.max(parseInt(page, 10), 1);
    const limitNum = Math.min(parseInt(limit, 10), 50);
    const skip = (pageNum - 1) * limitNum;

    let items: Awaited<ReturnType<typeof Item.find>>;
    let total: number;

    try {
      [items, total] = await Promise.all([
        Item.find(filter)
          .populate('reporterId', 'name email')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum),
        Item.countDocuments(filter),
      ]);
    } catch (textIndexErr) {
      // Text index not ready — fall back to regex search
      const fallbackFilter: Record<string, unknown> = {};
      if (q && q.trim()) {
        fallbackFilter.$or = [
          { title: { $regex: q.trim(), $options: 'i' } },
          { description: { $regex: q.trim(), $options: 'i' } },
          { locationName: { $regex: q.trim(), $options: 'i' } },
        ];
      }
      if (category) fallbackFilter.category = category;
      if (status) fallbackFilter.status = status;

      [items, total] = await Promise.all([
        Item.find(fallbackFilter)
          .populate('reporterId', 'name email')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum),
        Item.countDocuments(fallbackFilter),
      ]);
    }

    res.status(200).json({
      success: true,
      data: items,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum,
      },
    });
  } catch (error) {
    console.error('getItems error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch items.' });
  }
};

// ─── Get Single Item ──────────────────────────────────────────────────────────
export const getItemById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const item = await Item.findById(req.params.id).populate(
      'reporterId',
      'name email'
    );

    if (!item) {
      res.status(404).json({ success: false, message: 'Item not found.' });
      return;
    }

    res.status(200).json({ success: true, item });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch item.' });
  }
};

// ─── Update Item ──────────────────────────────────────────────────────────────
export const updateItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      res.status(404).json({ success: false, message: 'Item not found.' });
      return;
    }

    // Only reporter or admin can update
    if (
      String(item.reporterId) !== req.user!.id &&
      req.user!.role !== 'admin'
    ) {
      res
        .status(403)
        .json({ success: false, message: 'Not authorized to update this item.' });
      return;
    }

    const allowedFields = [
      'title',
      'description',
      'status',
      'locationName',
      'category',
    ] as const;
    type AllowedField = (typeof allowedFields)[number];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        (item as Record<AllowedField, unknown>)[field] = req.body[field];
      }
    }

    await item.save();

    res.status(200).json({ success: true, item });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to update item.';
    res.status(500).json({ success: false, message });
  }
};

// ─── Delete Item (Admin only) ─────────────────────────────────────────────────
export const deleteItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);

    if (!item) {
      res.status(404).json({ success: false, message: 'Item not found.' });
      return;
    }

    res.status(200).json({ success: true, message: 'Item deleted.' });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to delete item.' });
  }
};

// ─── Get My Items (Authenticated user's own items) ────────────────────────────
export const getMyItems = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const items = await Item.find({ reporterId: req.user!.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: items,
      pagination: {
        total: items.length,
        page: 1,
        pages: 1,
        limit: items.length,
      },
    });
  } catch {
    res
      .status(500)
      .json({ success: false, message: 'Failed to fetch your items.' });
  }
};

