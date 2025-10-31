# Storage Migration Guide

This guide will help you migrate from local storage to cloud storage (S3 or R2) for production deployment.

## Why Migrate?

**Local storage is not suitable for production** because:
- Vercel and most serverless platforms have **ephemeral filesystems**
- Files are deleted when the container restarts
- No shared storage across multiple instances
- Limited disk space

**Cloud storage benefits**:
- Persistent storage
- Scalable and reliable
- CDN integration
- Better performance globally

## Recommended: Cloudflare R2

For Vercel deployments, we recommend **Cloudflare R2** because:
- ✅ **No egress fees** (unlike S3)
- ✅ S3-compatible API (easy migration)
- ✅ Fast global CDN
- ✅ Generous free tier (10GB storage, 10M requests/month)
- ✅ Simple setup

## Step-by-Step Migration

### Option 1: Cloudflare R2 (Recommended)

#### 1. Create R2 Bucket

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Go to **R2** in the sidebar
3. Click **Create bucket**
4. Enter a bucket name (e.g., `cubis-academy-uploads`)
5. Click **Create bucket**

#### 2. Generate API Tokens

1. In R2 dashboard, click **Manage R2 API Tokens**
2. Click **Create API token**
3. Give it a name (e.g., `cubis-academy-production`)
4. Set permissions: **Object Read & Write**
5. (Optional) Restrict to specific bucket
6. Click **Create API token**
7. **Save the Access Key ID and Secret Access Key** (you won't see them again!)

#### 3. Set Up Custom Domain (Required for Public Access)

1. In your R2 bucket settings, go to **Settings** tab
2. Click **Connect Domain**
3. Enter your custom domain (e.g., `cdn.cubisacademy.com`)
4. Follow the DNS setup instructions
5. Wait for DNS propagation (usually a few minutes)

#### 4. Configure Environment Variables

Add these to your Vercel environment variables:

```env
STORAGE_PROVIDER=r2
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_BUCKET=cubis-academy-uploads
R2_PUBLIC_URL=https://cdn.cubisacademy.com
```

**Finding your R2 endpoint**:
- Go to R2 dashboard
- Click on your bucket
- Look for "S3 API" section
- Copy the endpoint URL

#### 5. Install Dependencies

```bash
pnpm add @aws-sdk/client-s3
```

#### 6. Deploy to Vercel

```bash
git add .
git commit -m "Configure R2 storage"
git push
```

Vercel will automatically redeploy with the new environment variables.

#### 7. Test Upload

1. Go to your production site
2. Try uploading a profile photo
3. Verify the image appears correctly
4. Check the R2 bucket to confirm the file was uploaded

### Option 2: AWS S3

#### 1. Create S3 Bucket

1. Log in to [AWS Console](https://console.aws.amazon.com/)
2. Go to **S3** service
3. Click **Create bucket**
4. Enter a bucket name (e.g., `cubis-academy-uploads`)
5. Choose a region (e.g., `us-east-1`)
6. **Uncheck "Block all public access"** (for public files)
7. Click **Create bucket**

#### 2. Configure Bucket Policy

1. Go to your bucket → **Permissions** tab
2. Scroll to **Bucket policy**
3. Add this policy (replace `YOUR-BUCKET-NAME`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}
```

#### 3. Create IAM User

1. Go to **IAM** service
2. Click **Users** → **Add users**
3. Enter username (e.g., `cubis-academy-s3`)
4. Click **Next**
5. Select **Attach policies directly**
6. Search and select **AmazonS3FullAccess**
7. Click **Next** → **Create user**

#### 4. Generate Access Keys

1. Click on the created user
2. Go to **Security credentials** tab
3. Click **Create access key**
4. Select **Application running outside AWS**
5. Click **Next** → **Create access key**
6. **Save the Access Key ID and Secret Access Key**

#### 5. (Optional) Set Up CloudFront CDN

For better performance:

1. Go to **CloudFront** service
2. Click **Create distribution**
3. Set **Origin domain** to your S3 bucket
4. Configure settings as needed
5. Click **Create distribution**
6. Wait for deployment (15-20 minutes)
7. Use the CloudFront URL as `AWS_S3_PUBLIC_URL`

#### 6. Configure Environment Variables

```env
STORAGE_PROVIDER=s3
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=cubis-academy-uploads
AWS_S3_PUBLIC_URL=https://d1234567890.cloudfront.net  # Optional CDN URL
```

#### 7. Install Dependencies

```bash
pnpm add @aws-sdk/client-s3
```

#### 8. Deploy

```bash
git add .
git commit -m "Configure S3 storage"
git push
```

## Migrating Existing Files

If you have existing files in local storage that need to be migrated:

### 1. Create Migration Script

Create `scripts/migrate-storage.ts`:

```typescript
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { db } from '@/lib/drizzle/db';
import { uploads } from '@/lib/drizzle/schema';
import { eq } from 'drizzle-orm';
import { getStorageProvider } from '@/lib/storage';

async function migrateFiles() {
  console.log('Starting file migration...');
  
  const provider = getStorageProvider();
  
  // Get all files from database with local storage
  const localFiles = await db
    .select()
    .from(uploads)
    .where(eq(uploads.storageType, 'local'));

  console.log(`Found ${localFiles.length} files to migrate`);

  let migrated = 0;
  let failed = 0;

  for (const file of localFiles) {
    try {
      // Read local file
      const localPath = join(process.cwd(), 'public', file.filePath);
      const buffer = await readFile(localPath);

      // Create File object
      const fileObj = new File([buffer], file.fileName, { type: file.mimeType });

      // Upload to new provider
      const result = await provider.upload(fileObj, {
        userId: file.userId,
        category: file.category as any,
        isPublic: file.isPublic,
      });

      // Update database
      await db
        .update(uploads)
        .set({
          fileUrl: result.fileUrl,
          filePath: result.id,
          storageType: result.storageType,
        })
        .where(eq(uploads.id, file.id));

      migrated++;
      console.log(`✓ Migrated: ${file.fileName}`);
    } catch (error) {
      failed++;
      console.error(`✗ Failed: ${file.fileName}`, error);
    }
  }

  console.log(`\nMigration complete!`);
  console.log(`Migrated: ${migrated}`);
  console.log(`Failed: ${failed}`);
}

migrateFiles().catch(console.error);
```

### 2. Run Migration

```bash
# Make sure new storage provider is configured
tsx scripts/migrate-storage.ts
```

### 3. Verify Migration

1. Check that files are accessible via new URLs
2. Verify database records are updated
3. Test uploading new files

### 4. Clean Up Local Files (Optional)

After verifying migration:

```bash
rm -rf public/uploads/*
```

## Vercel Deployment Checklist

- [ ] Choose storage provider (R2 recommended)
- [ ] Create bucket/container
- [ ] Generate API credentials
- [ ] Set up custom domain (R2) or CloudFront (S3)
- [ ] Add environment variables to Vercel
- [ ] Install `@aws-sdk/client-s3` dependency
- [ ] Deploy to Vercel
- [ ] Test file upload
- [ ] Verify files are accessible
- [ ] (Optional) Migrate existing files
- [ ] Update documentation

## Troubleshooting

### "R2_PUBLIC_URL must be configured"

R2 requires a custom domain for public access. Follow the custom domain setup steps above.

### "Access Denied" errors

Check your bucket policy (S3) or ensure the API token has correct permissions (R2).

### Files not appearing

1. Check environment variables are set correctly
2. Verify bucket name matches
3. Check CORS configuration if accessing from browser
4. Verify custom domain DNS is propagated (R2)

### Slow uploads

1. Choose a region close to your users
2. Set up CDN (CloudFront for S3, automatic for R2)
3. Enable image optimization

## Cost Estimation

### Cloudflare R2 (Recommended)

**Free Tier**:
- 10 GB storage
- 10 million requests/month

**Paid** (after free tier):
- Storage: $0.015/GB/month
- Requests: $4.50/million writes, $0.36/million reads
- **Egress: FREE** (no bandwidth charges!)

**Example**: 100GB storage, 50M requests/month
- Storage: 90GB × $0.015 = $1.35
- Requests: 40M × $0.36/M = $14.40
- Egress: $0
- **Total: ~$16/month**

### AWS S3

**Pricing**:
- Storage: $0.023/GB/month
- Requests: $0.0004/1000 PUT, $0.0004/1000 GET
- **Egress: $0.09/GB** (first 10TB)

**Example**: 100GB storage, 50M requests/month, 500GB egress
- Storage: 100GB × $0.023 = $2.30
- Requests: 50M × $0.0004/1000 = $20
- Egress: 500GB × $0.09 = $45
- **Total: ~$67/month**

**Recommendation**: Use R2 to save on egress costs!

## Support

If you encounter issues:

1. Check the [Storage README](../lib/storage/README.md)
2. Review Vercel deployment logs
3. Verify environment variables
4. Check bucket/container permissions
5. Test with a simple upload first

## Next Steps

After migration:

1. Monitor storage usage
2. Set up backup strategy
3. Configure CDN caching
4. Implement image optimization
5. Set up monitoring/alerts
6. Document your setup for team
