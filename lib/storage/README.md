# Storage System

A flexible, provider-agnostic file storage system that supports multiple storage backends.

## Supported Providers

- **Local** - Filesystem storage (development only, not suitable for Vercel)
- **AWS S3** - Amazon S3 storage
- **Cloudflare R2** - Cloudflare R2 (S3-compatible, recommended for Vercel)

## Quick Start

### 1. Install Dependencies

For S3 or R2 providers:

```bash
pnpm add @aws-sdk/client-s3
```

### 2. Configure Environment Variables

Set the storage provider in your `.env` file:

```env
STORAGE_PROVIDER=local  # or 's3' or 'r2'
```

### 3. Provider-Specific Configuration

#### Local Storage (Development)

```env
STORAGE_PROVIDER=local
UPLOAD_DIR=public/uploads
UPLOAD_PUBLIC_PATH=/uploads
```

**Note**: Local storage is not suitable for Vercel or serverless deployments as the filesystem is ephemeral.

#### AWS S3 (Production)

```env
STORAGE_PROVIDER=s3
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
AWS_S3_PUBLIC_URL=https://cdn.yourdomain.com  # Optional CDN URL
```

**Setup Steps**:
1. Create an S3 bucket in AWS Console
2. Create an IAM user with S3 permissions
3. Generate access keys for the IAM user
4. Configure bucket policy for public read access (if needed)
5. (Optional) Set up CloudFront CDN for better performance

#### Cloudflare R2 (Recommended for Vercel)

```env
STORAGE_PROVIDER=r2
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_BUCKET=your-bucket-name
R2_PUBLIC_URL=https://your-custom-domain.com  # Required for public access
```

**Setup Steps**:
1. Create an R2 bucket in Cloudflare Dashboard
2. Generate R2 API tokens (Access Key ID and Secret)
3. Set up a custom domain for public access
4. Configure CORS if needed

**Why R2 for Vercel?**
- No egress fees (unlike S3)
- S3-compatible API
- Fast global CDN
- Generous free tier (10GB storage, 10M requests/month)

## Metadata Tracking (S3/R2)

S3 and R2 uploads automatically include essential metadata for tracking:

```typescript
// Metadata automatically added to S3/R2 uploads:
{
  'user-id': 'uuid-of-uploader',
  'category': 'profile',
  'uploaded-at': '2025-01-15T10:30:00.000Z'
}
```

**Why These Keys?**
- `user-id` - Track who uploaded (for auditing and cleanup)
- `category` - Organize and filter files by type
- `uploaded-at` - Timestamp for lifecycle policies and auditing

**Benefits**:
- Track file ownership
- Filter files by category
- Audit trail with timestamps
- Easy debugging and troubleshooting
- Support for lifecycle policies

**Viewing Metadata**:
- **AWS S3**: Console → Object → Metadata tab
- **Cloudflare R2**: Dashboard → Object → Metadata section

**Note**: Local storage does not support metadata (filesystem limitation).

## Usage

### Basic Upload

```typescript
import { uploadFile } from '@/lib/storage';

const result = await uploadFile(file, {
  userId: session.user.id,
  category: 'profile',
  isPublic: true,
});

console.log(result.fileUrl); // Public URL to access the file
```

### Upload with Image Resizing

```typescript
const result = await uploadFile(file, {
  userId: session.user.id,
  category: 'profile',
  resize: {
    width: 400,
    height: 400,
    fit: 'cover',
  },
});
```

### Upload with Validation

```typescript
const result = await uploadFile(file, {
  userId: session.user.id,
  category: 'document',
  maxSize: 20 * 1024 * 1024, // 20MB
  allowedTypes: ['application/pdf', 'application/msword'],
});
```

### Delete File

```typescript
import { deleteFile } from '@/lib/storage';

await deleteFile(fileKey);
```

### Get File URL

```typescript
import { getFileUrl } from '@/lib/storage';

const url = getFileUrl(fileKey);
```

## Categories

The system supports the following file categories:

- `profile` - User profile photos (auto-resized to 400x400)
- `course_cover` - Course cover images (auto-resized to 1200x630)
- `document` - PDF, Word, Excel files
- `course_material` - Course-related files (videos, PDFs, etc.)
- `general` - Other files

## API Endpoint

The upload API is available at `/api/upload`:

```typescript
const formData = new FormData();
formData.append('file', file);
formData.append('category', 'profile');
formData.append('isPublic', 'true');

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
console.log(result.fileUrl);
```

## Architecture

```
lib/storage/
├── index.ts              # Main entry point, factory pattern
├── types.ts              # TypeScript interfaces
├── config.ts             # Configuration management
├── providers/
│   ├── local.ts          # Local filesystem provider
│   ├── s3.ts             # AWS S3 provider
│   └── r2.ts             # Cloudflare R2 provider
└── README.md             # This file
```

## Adding a New Provider

To add a new storage provider:

1. Create a new file in `lib/storage/providers/`
2. Implement the `IStorageProvider` interface
3. Add configuration in `lib/storage/config.ts`
4. Register the provider in `lib/storage/index.ts`

Example:

```typescript
// lib/storage/providers/custom.ts
import { IStorageProvider, UploadOptions, UploadResult } from '../types';

export class CustomStorageProvider implements IStorageProvider {
  async upload(file: File, options: UploadOptions): Promise<UploadResult> {
    // Your implementation
  }

  async delete(fileKey: string): Promise<void> {
    // Your implementation
  }

  getUrl(fileKey: string): string {
    // Your implementation
  }
}
```

## Migration Guide

### From Local to S3/R2

1. Set up your S3/R2 bucket and credentials
2. Update environment variables
3. Restart your application
4. (Optional) Migrate existing files:

```typescript
// Migration script example
import { getStorageProvider } from '@/lib/storage';
import { db } from '@/lib/drizzle/db';
import { uploads } from '@/lib/drizzle/schema';

async function migrateFiles() {
  const provider = getStorageProvider();
  const files = await db.select().from(uploads).where(eq(uploads.storageType, 'local'));

  for (const file of files) {
    // Read local file
    const localPath = path.join(process.cwd(), 'public', file.filePath);
    const buffer = await fs.readFile(localPath);
    
    // Upload to new provider
    const result = await provider.upload(
      new File([buffer], file.fileName, { type: file.mimeType }),
      { userId: file.userId, category: file.category }
    );

    // Update database
    await db.update(uploads)
      .set({ fileUrl: result.fileUrl, storageType: result.storageType })
      .where(eq(uploads.id, file.id));
  }
}
```

## Best Practices

1. **Use R2 for Vercel deployments** - No egress fees, S3-compatible
2. **Set up CDN** - Use CloudFront (S3) or custom domain (R2) for better performance
3. **Configure CORS** - Allow your domain to access uploaded files
4. **Set cache headers** - Files are uploaded with 1-year cache control
5. **Validate file types** - Always validate on the server side
6. **Limit file sizes** - Set appropriate limits per category
7. **Use image optimization** - Enable auto-resizing for images
8. **Monitor storage usage** - Track uploads in the database

## Troubleshooting

### "Storage provider not configured"

Make sure you've set the `STORAGE_PROVIDER` environment variable and all required credentials.

### "R2_PUBLIC_URL must be configured"

R2 requires a custom domain for public access. Set up a custom domain in Cloudflare and add it to `R2_PUBLIC_URL`.

### "File size exceeds limit"

Increase the `maxSize` option in your upload call or adjust the category-specific limits in the API route.

### Images not resizing

Make sure `sharp` is installed: `pnpm add sharp`

## Performance Tips

1. **Use CDN** - Serve files through CloudFront or Cloudflare CDN
2. **Optimize images** - Enable auto-resizing for profile photos and covers
3. **Set cache headers** - Files are cached for 1 year by default
4. **Use WebP format** - Consider converting images to WebP for better compression
5. **Lazy load images** - Use Next.js Image component for automatic optimization

## Security Considerations

1. **Validate file types** - Always check MIME types on the server
2. **Scan for malware** - Consider integrating virus scanning for user uploads
3. **Set file size limits** - Prevent abuse with appropriate size limits
4. **Use signed URLs** - For private files, use pre-signed URLs (S3/R2)
5. **Implement rate limiting** - Prevent upload spam
6. **Check user permissions** - Verify user has permission to upload

## Cost Comparison

### AWS S3
- Storage: $0.023/GB/month
- Egress: $0.09/GB (first 10TB)
- Requests: $0.0004/1000 PUT, $0.0004/1000 GET

### Cloudflare R2
- Storage: $0.015/GB/month
- Egress: **FREE** (no egress fees!)
- Requests: $4.50/million writes, $0.36/million reads
- Free tier: 10GB storage, 10M requests/month

**Recommendation**: Use R2 for production to save on egress costs.
