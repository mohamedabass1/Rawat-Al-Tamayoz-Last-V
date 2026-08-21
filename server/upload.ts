import fs from 'fs';
import path from 'path';
import multer from 'multer';
import crypto from 'crypto';
import { isSupabaseConfigured, uploadToSupabaseStorage } from './supabase.js';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const ALLOWED_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/svg+xml'
];

// Memory storage for fast buffer access (compatible with both Supabase Storage and local fallback)
const storage = multer.memoryStorage();

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB limit per file
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('نوع الملف غير مدعوم. الأنواع المسموحة هي: JPG, PNG, WEBP, AVIF, SVG'));
    }
  }
});

/**
 * Saves an uploaded Multer file either to Supabase Storage (if configured) or locally.
 * Returns the public image URL.
 */
export async function processUploadedFile(file: Express.Multer.File): Promise<{
  url: string;
  originalName: string;
  size: number;
  mimeType: string;
}> {
  if (isSupabaseConfigured()) {
    try {
      const ext = path.extname(file.originalname).toLowerCase();
      const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
      const uniqueFileName = `${baseName}_${Date.now()}${ext}`;

      const { url } = await uploadToSupabaseStorage(
        file.buffer,
        uniqueFileName,
        file.mimetype
      );

      return {
        url,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype
      };
    } catch (err) {
      console.warn('Supabase storage upload failed, falling back to local storage:', err);
    }
  }

  // Local fallback
  const randomHex = crypto.randomBytes(8).toString('hex');
  const ext = path.extname(file.originalname).toLowerCase();
  const safeName = `img_${Date.now()}_${randomHex}${ext}`;
  const targetPath = path.join(UPLOAD_DIR, safeName);

  fs.writeFileSync(targetPath, file.buffer);

  return {
    url: `/uploads/${safeName}`,
    originalName: file.originalname,
    size: file.size,
    mimeType: file.mimetype
  };
}
