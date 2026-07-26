import multer from 'multer';

// ─── Check if Cloudinary is configured ───────────────────────────────────────
const cloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

let storage: multer.StorageEngine;

if (cloudinaryConfigured) {
  // ── Cloudinary Storage Engine (only when credentials are provided) ──────────
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const cloudinary = require('../config/cloudinary').default;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { CloudinaryStorage } = require('multer-storage-cloudinary');

  storage = new CloudinaryStorage({
    cloudinary,
    params: async (_req: unknown, file: Express.Multer.File) => ({
      folder: 'losthub/items',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 1200, height: 900, crop: 'limit', quality: 85 }],
      public_id: `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`,
    }),
  }) as multer.StorageEngine;
} else {
  // ── Local Disk Storage fallback (no Cloudinary) ─────────────────────────────
  console.warn('⚠️  Cloudinary not configured — images stored locally in /uploads directory.');
  storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (_req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
    }
  });
}

// ─── File Filter ──────────────────────────────────────────────────────────────
const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP images are allowed.'));
  }
};

// ─── Upload Middleware ────────────────────────────────────────────────────────
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 5, // max 5 files
  },
});
