import fs from "fs";
import path from "path";
import multer from "multer";
import crypto from "crypto";
import { isSupabaseConfigured, uploadToSupabaseStorage } from "./supabase.js";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

function getUploadDir(): string {
  try {
    if (fs.existsSync(UPLOAD_DIR)) {
      return UPLOAD_DIR;
    }
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    return UPLOAD_DIR;
  } catch {
    // In serverless / read-only environment like Vercel, fallback to /tmp
    const tmpUploads = path.join("/tmp", "uploads");
    try {
      if (!fs.existsSync(tmpUploads)) {
        fs.mkdirSync(tmpUploads, { recursive: true });
      }
      return tmpUploads;
    } catch {
      return "/tmp";
    }
  }
}

const ALLOWED_MIME_PREFIXES = ["image/"];
const ALLOWED_IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
  ".svg",
  ".gif",
  ".heic",
  ".heif",
  ".bmp",
  ".tiff",
];

// Memory storage for fast buffer access (compatible with both Supabase Storage and local fallback)
const storage = multer.memoryStorage();

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB limit per file (handles 4K / mobile camera photos)
  },
  fileFilter: (_req, file, cb) => {
    const isImageMime =
      file.mimetype &&
      (ALLOWED_MIME_PREFIXES.some((p) => file.mimetype.startsWith(p)) ||
        file.mimetype === "application/octet-stream");
    const ext = path.extname(file.originalname || "").toLowerCase();
    const hasImageExt = ALLOWED_IMAGE_EXTENSIONS.includes(ext);

    if (isImageMime || hasImageExt) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "نوع الملف غير مدعوم. يرجى اختيار ملف صورة صالح (JPG, PNG, WEBP, HEIC, SVG).",
        ),
      );
    }
  },
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
      const baseName = path
        .basename(file.originalname, ext)
        .replace(/[^a-zA-Z0-9]/g, "_");
      const uniqueFileName = `${baseName}_${Date.now()}${ext}`;

      const { url } = await uploadToSupabaseStorage(
        file.buffer,
        uniqueFileName,
        file.mimetype,
      );

      return {
        url,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
      };
    } catch (err) {
      console.warn(
        "Supabase storage upload failed, falling back to local storage:",
        err,
      );
    }
  }

  // Local fallback
  const randomHex = crypto.randomBytes(8).toString("hex");
  const ext = path.extname(file.originalname).toLowerCase();
  const safeName = `img_${Date.now()}_${randomHex}${ext}`;
  const targetDir = getUploadDir();
  const targetPath = path.join(targetDir, safeName);

  let localUrl = `/uploads/${safeName}`;
  let writeSuccess = false;

  try {
    fs.writeFileSync(targetPath, file.buffer);
    writeSuccess = true;
  } catch (err) {
    console.error(
      "Failed to write uploaded file locally, using data URI fallback:",
      err,
    );
  }

  // If on a stateless serverless instance without Supabase and write failed, fallback to base64 Data URL
  if (!writeSuccess && process.env.VERCEL) {
    const base64Data = file.buffer.toString("base64");
    localUrl = `data:${file.mimetype};base64,${base64Data}`;
  }

  return {
    url: localUrl,
    originalName: file.originalname,
    size: file.size,
    mimeType: file.mimetype,
  };
}
