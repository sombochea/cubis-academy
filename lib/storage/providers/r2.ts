/**
 * Cloudflare R2 Storage Provider
 * 
 * Stores files in Cloudflare R2 (S3-compatible)
 * Requires: @aws-sdk/client-s3
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { IStorageProvider, UploadOptions, UploadResult, StorageConfig } from '../types';

export class R2StorageProvider implements IStorageProvider {
  private client: S3Client;
  private bucket: string;
  private publicUrl?: string;

  constructor(config: StorageConfig) {
    if (!config.accessKeyId || !config.secretAccessKey || !config.endpoint || !config.bucket) {
      throw new Error('R2 configuration is incomplete');
    }

    this.client = new S3Client({
      region: 'auto', // R2 uses 'auto' for region
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });

    this.bucket = config.bucket;
    this.publicUrl = config.publicUrl;
  }

  private generateFileKey(category: string, originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const ext = originalName.split('.').pop();
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
    const sanitized = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    return `${category}/${sanitized}-${timestamp}-${random}.${ext}`;
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

    // Generate file key
    const fileKey = this.generateFileKey(category, file.name);

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: fileKey,
      Body: buffer,
      ContentType: file.type,
      CacheControl: 'max-age=31536000', // 1 year
    });

    await this.client.send(command);

    // Generate public URL
    const fileUrl = this.getUrl(fileKey);

    return {
      id: fileKey,
      fileName: file.name,
      fileUrl,
      fileSize: buffer.length,
      mimeType: file.type,
      storageType: 'r2',
    };
  }

  async delete(fileKey: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: fileKey,
    });

    await this.client.send(command);
  }

  getUrl(fileKey: string): string {
    if (this.publicUrl) {
      // Use custom domain if configured
      return `${this.publicUrl}/${fileKey}`;
    }
    // R2 doesn't have a default public URL, must configure custom domain
    throw new Error('R2_PUBLIC_URL must be configured for public access');
  }
}
