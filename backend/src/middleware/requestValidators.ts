import { Request, Response, NextFunction } from 'express';

// ─── Helper ───────────────────────────────────────────────────────────────────
const fail = (res: Response, message: string): void => {
  res.status(400).json({ success: false, message });
};

const ITEM_CATEGORIES = [
  'Electronics', 'Clothing', 'Accessories', 'Books',
  'ID & Cards', 'Keys', 'Bags', 'Sports', 'Other',
] as const;

const ITEM_STATUSES = ['Lost', 'Found', 'Claimed'] as const;

// ─── Auth: Register ───────────────────────────────────────────────────────────
export const validateRegister = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { name, email, password } = req.body as Record<string, string>;

  if (!name || name.trim().length < 2) {
    return void fail(res, 'Name must be at least 2 characters.');
  }
  if (name.trim().length > 80) {
    return void fail(res, 'Name cannot exceed 80 characters.');
  }

  if (!email || !email.trim()) {
    return void fail(res, 'Email is required.');
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return void fail(res, 'Please provide a valid email address.');
  }

  if (!password) {
    return void fail(res, 'Password is required.');
  }
  if (password.length < 8) {
    return void fail(res, 'Password must be at least 8 characters.');
  }
  if (!/[A-Z]/.test(password)) {
    return void fail(res, 'Password must contain at least one uppercase letter.');
  }
  if (!/[0-9]/.test(password)) {
    return void fail(res, 'Password must contain at least one number.');
  }

  next();
};

// ─── Auth: Login ──────────────────────────────────────────────────────────────
export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { email, password } = req.body as Record<string, string>;

  if (!email || !email.trim()) {
    return void fail(res, 'Email is required.');
  }
  if (!password) {
    return void fail(res, 'Password is required.');
  }

  next();
};

// ─── Item: Create ─────────────────────────────────────────────────────────────
export const validateCreateItem = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { title, description, category, locationName, coordinates, status } =
    req.body as Record<string, unknown>;

  // Title
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return void fail(res, 'Title is required.');
  }
  if ((title as string).trim().length > 120) {
    return void fail(res, 'Title cannot exceed 120 characters.');
  }

  // Description
  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    return void fail(res, 'Description is required.');
  }
  if ((description as string).trim().length > 1000) {
    return void fail(res, 'Description cannot exceed 1000 characters.');
  }

  // Category
  if (!category || !ITEM_CATEGORIES.includes(category as (typeof ITEM_CATEGORIES)[number])) {
    return void fail(
      res,
      `Category must be one of: ${ITEM_CATEGORIES.join(', ')}.`
    );
  }

  // Status (optional — defaults to 'Lost')
  if (status !== undefined && !ITEM_STATUSES.includes(status as (typeof ITEM_STATUSES)[number])) {
    return void fail(res, `Status must be one of: ${ITEM_STATUSES.join(', ')}.`);
  }

  // Location name
  if (!locationName || typeof locationName !== 'string' || locationName.trim().length === 0) {
    return void fail(res, 'Location name is required.');
  }

  // Coordinates — can arrive as JSON string (multipart) or object (json body)
  let coords: { lat: unknown; lng: unknown } | null = null;
  if (typeof coordinates === 'string') {
    try {
      coords = JSON.parse(coordinates) as { lat: unknown; lng: unknown };
    } catch {
      return void fail(res, 'Coordinates must be a valid JSON object with lat and lng.');
    }
  } else if (typeof coordinates === 'object' && coordinates !== null) {
    coords = coordinates as { lat: unknown; lng: unknown };
  }

  if (!coords) {
    return void fail(res, 'Coordinates are required (lat, lng).');
  }

  const lat = Number(coords.lat);
  const lng = Number(coords.lng);

  if (isNaN(lat) || lat < -90 || lat > 90) {
    return void fail(res, 'Latitude must be a number between -90 and 90.');
  }
  if (isNaN(lng) || lng < -180 || lng > 180) {
    return void fail(res, 'Longitude must be a number between -180 and 180.');
  }

  // Normalize parsed coords back onto body so controller sees an object
  req.body.coordinates = { lat, lng };

  next();
};

// ─── Item: Update ─────────────────────────────────────────────────────────────
export const validateUpdateItem = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { title, description, category, status, locationName } =
    req.body as Record<string, unknown>;

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length === 0) {
      return void fail(res, 'Title cannot be empty.');
    }
    if (title.trim().length > 120) {
      return void fail(res, 'Title cannot exceed 120 characters.');
    }
  }

  if (description !== undefined) {
    if (typeof description !== 'string' || description.trim().length === 0) {
      return void fail(res, 'Description cannot be empty.');
    }
    if (description.trim().length > 1000) {
      return void fail(res, 'Description cannot exceed 1000 characters.');
    }
  }

  if (
    category !== undefined &&
    !ITEM_CATEGORIES.includes(category as (typeof ITEM_CATEGORIES)[number])
  ) {
    return void fail(res, `Category must be one of: ${ITEM_CATEGORIES.join(', ')}.`);
  }

  if (
    status !== undefined &&
    !ITEM_STATUSES.includes(status as (typeof ITEM_STATUSES)[number])
  ) {
    return void fail(res, `Status must be one of: ${ITEM_STATUSES.join(', ')}.`);
  }

  if (locationName !== undefined) {
    if (typeof locationName !== 'string' || locationName.trim().length === 0) {
      return void fail(res, 'Location name cannot be empty.');
    }
  }

  next();
};
