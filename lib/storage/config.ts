/**
 * Storage Configuration
 * 
 * Centralized configuration for storage providers
 */

import { StorageConfig, StorageProvider } from './types';

export function getStorageConfig(): StorageConfig {
  const provider = (process.env.STORAGE_PROVIDER || 'local') as StorageProvider;

  const config: StorageConfig = {
    provider,
  };

  switch (provider) {
    case 's3':
      config.accessKeyId = process.env.AWS_ACCESS_KEY_ID;
      config.secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
      config.region = process.env.AWS_REGION || 'us-east-1';
      config.bucket = process.env.AWS_S3_BUCKET;
      config.publicUrl = process.env.AWS_S3_PUBLIC_URL; // Optional CDN URL
      break;

    case 'r2':
      config.accessKeyId = process.env.R2_ACCESS_KEY_ID;
      config.secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
      config.endpoint = process.env.R2_ENDPOINT; // e.g., https://account-id.r2.cloudflarestorage.com
      config.bucket = process.env.R2_BUCKET;
      config.publicUrl = process.env.R2_PUBLIC_URL; // Your R2 public domain
      break;

    case 'local':
    default:
      config.uploadDir = process.env.UPLOAD_DIR || 'public/uploads';
      config.publicPath = process.env.UPLOAD_PUBLIC_PATH || '/uploads';
      break;
  }

  return config;
}

export function validateStorageConfig(config: StorageConfig): void {
  switch (config.provider) {
    case 's3':
      if (!config.accessKeyId || !config.secretAccessKey || !config.bucket) {
        throw new Error('S3 storage requires AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_S3_BUCKET');
      }
      break;

    case 'r2':
      if (!config.accessKeyId || !config.secretAccessKey || !config.endpoint || !config.bucket) {
        throw new Error('R2 storage requires R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ENDPOINT, and R2_BUCKET');
      }
      break;

    case 'local':
      // Local storage doesn't require validation
      break;

    default:
      throw new Error(`Unknown storage provider: ${config.provider}`);
  }
}
