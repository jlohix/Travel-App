import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

/**
 * Saves an uploaded image File to public/uploads and returns its public URL,
 * or throws on validation error. Returns null if no file was provided.
 */
export async function saveImage(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null;

  const ext = ALLOWED.get(file.type);
  if (!ext) {
    throw new Error("Unsupported image type. Use JPG, PNG, WEBP, or GIF.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Image is too large (max 5MB).");
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);

  return `/uploads/${filename}`;
}
