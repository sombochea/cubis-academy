/**
 * Storage Provider Types
 * 
 * Defines interfaces for different storage providers (local, S3, R2)
 */

export type StorageProvider = 'local' | 's3' | 'r2';

export interface UploadOptions {
  userId: string;
  category: 'profile' | 'document' | 'course_material' | 'course_cover' | 'general';
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
  storageType: StorageProvider;
}

export interface StorageConfig {
  provider: StorageProvider;
  
  // S3 / R2 Configuration
  accessKeyId?: string;
  secretAccessKey?: string;
  region?: string;
  bucket?: string;
  endpoint?: string; // For R2 or S3-compatible services
  publicUrl?: string; // CDN URL for public access
  
  // Local Configuration
  uploadDir?: string;
  publicPath?: string;
}

export interface IStorageProvider {
  upload(file: File, options: UploadOptions): Promise<UploadResult>;
  delete(fileKey: string): Promise<void>;
  getUrl(fileKey: string): string;
}
