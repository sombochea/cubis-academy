import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import sharp from 'sharp';

export interface UploadOptions {
  userId: string;
  category: 'profile' | 'document' | 'course_material' | 'general';
  isPublic?: boolean;
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  resize?: {
    width: number;
    height: number;
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  };
}

export interface UploadResult {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
}

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB default

// Ensure upload directory exists
async function ensureUploadDir(category: string) {
  const categoryDir = path.join(UPLOAD_DIR, category);
  if (!existsSync(categoryDir)) {
    await mkdir(categoryDir, { recursive: true });
  }
  return categoryDir;
}

// Generate unique filename
function generateFileName(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const ext = path.extname(originalName);
  const nameWithoutExt = path.basename(originalName, ext);
  const sanitized = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  return `${sanitized}-${timestamp}-${random}${ext}`;
}

// Process image with sharp
async function processImage(
  buffer: Buffer,
  options?: UploadOptions['resize']
): Promise<Buffer> {
  let image = sharp(buffer);

  if (options) {
    image = image.resize({
      width: options.width,
      height: options.height,
      fit: options.fit || 'cover',
      position: 'center',
    });
  }

  // Convert to JPEG for consistency and compression
  return await image.jpeg({ quality: 85 }).toBuffer();
}

export async function uploadFile(
  file: File,
  options: UploadOptions
): Promise<UploadResult> {
  const {
    userId,
    category,
    isPublic = false,
    maxSize = MAX_FILE_SIZE,
    allowedTypes,
    resize,
  } = options;

  // Validate file size
  if (file.size > maxSize) {
    throw new Error(`File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`);
  }

  // Validate file type
  if (allowedTypes && !allowedTypes.includes(file.type)) {
    throw new Error(`File type ${file.type} is not allowed`);
  }

  // Get file buffer
  const bytes = await file.arrayBuffer();
  let buffer = Buffer.from(bytes);

  // Process image if resize options provided and file is an image
  if (resize && file.type.startsWith('image/')) {
    buffer = await processImage(buffer, resize);
  }

  // Generate filename and paths
  const fileName = generateFileName(file.name);
  const categoryDir = await ensureUploadDir(category);
  const filePath = path.join(categoryDir, fileName);
  const relativePath = path.join('uploads', category, fileName);
  const fileUrl = `/${relativePath}`;

  // Write file to disk
  await writeFile(filePath, buffer);

  // Return upload result (metadata tracking can be added later)
  return {
    id: fileName,
    fileName,
    fileUrl,
    fileSize: buffer.length,
    mimeType: file.type,
  };
}

// Delete file from filesystem
export async function deleteFile(filePath: string): Promise<void> {
  const fullPath = path.join(process.cwd(), 'public', filePath);
  if (existsSync(fullPath)) {
    const { unlink } = await import('fs/promises');
    await unlink(fullPath);
  }
}
