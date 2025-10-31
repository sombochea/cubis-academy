/**
 * Storage Factory
 * 
 * Creates the appropriate storage provider based on configuration
 */

import { IStorageProvider, UploadOptions, UploadResult } from './types';
import { getStorageConfig, validateStorageConfig } from './config';
import { LocalStorageProvider } from './providers/local';
import { S3StorageProvider } from './providers/s3';
import { R2StorageProvider } from './providers/r2';

let storageProvider: IStorageProvider | null = null;

export function getStorageProvider(): IStorageProvider {
  if (storageProvider) {
    return storageProvider;
  }

  const config = getStorageConfig();
  validateStorageConfig(config);

  switch (config.provider) {
    case 's3':
      storageProvider = new S3StorageProvider(config);
      break;

    case 'r2':
      storageProvider = new R2StorageProvider(config);
      break;

    case 'local':
    default:
      storageProvider = new LocalStorageProvider(config);
      break;
  }

  return storageProvider;
}

// Convenience functions
export async function uploadFile(
  file: File,
  options: UploadOptions
): Promise<UploadResult> {
  const provider = getStorageProvider();
  
  // Validate file size
  const maxSize = options.maxSize || 10 * 1024 * 1024; // 10MB default
  if (file.size > maxSize) {
    throw new Error(`File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`);
  }

  // Validate file type
  if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
    throw new Error(`File type ${file.type} is not allowed`);
  }

  return await provider.upload(file, options);
}

export async function deleteFile(fileKey: string): Promise<void> {
  const provider = getStorageProvider();
  return await provider.delete(fileKey);
}

export function getFileUrl(fileKey: string): string {
  const provider = getStorageProvider();
  return provider.getUrl(fileKey);
}

// Re-export types
export * from './types';
