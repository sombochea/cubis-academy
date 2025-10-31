/**
 * Local Storage Provider
 * 
 * Stores files in the local filesystem (public/uploads)
 * Note: Not suitable for Vercel or serverless deployments
 */

import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import sharp from 'sharp';
import { IStorageProvider, UploadOptions, UploadResult, StorageConfig } from '../types';

export class LocalStorageProvider implements IStorageProvider {
  private uploadDir: string;
  private publicPath: string;

  constructor(config: StorageConfig) {
    this.uploadDir = config.uploadDir || 'public/uploads';
    this.publicPath = config.publicPath || '/uploads';
  }

  private async ensureDir(category: string): Promise<string> {
    const categoryDir = path.join(process.cwd(), this.uploadDir, category);
    if (!existsSync(categoryDir)) {
      await mkdir(categoryDir, { recursive: true });
    }
    return categoryDir;
  }

  private generateFileName(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const ext = path.extname(originalName);
    const nameWithoutExt = path.basename(originalName, ext);
    const sanitized = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    return `${sanitized}-${timestamp}-${random}${ext}`;
  }

  private async processImage(
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

    return await image.jpeg({ quality: 85 }).toBuffer();
  }

  async upload(file: File, options: UploadOptions): Promise<UploadResult> {
    const { category, resize } = options;

    // Get file buffer
    const bytes = await file.arrayBuffer();
    let buffer = Buffer.from(bytes);

    // Process image if resize options provided
    if (resize && file.type.startsWith('image/')) {
      buffer = await this.processImage(buffer, resize);
    }

    // Generate filename and paths
    const fileName = this.generateFileName(file.name);
    const categoryDir = await this.ensureDir(category);
    const filePath = path.join(categoryDir, fileName);
    const fileUrl = `${this.publicPath}/${category}/${fileName}`;

    // Write file to disk
    await writeFile(filePath, buffer);

    return {
      id: fileName,
      fileName,
      fileUrl,
      fileSize: buffer.length,
      mimeType: file.type,
      storageType: 'local',
    };
  }

  async delete(fileKey: string): Promise<void> {
    const filePath = path.join(process.cwd(), this.uploadDir, fileKey);
    if (existsSync(filePath)) {
      await unlink(filePath);
    }
  }

  getUrl(fileKey: string): string {
    return `${this.publicPath}/${fileKey}`;
  }
}
