import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/drizzle/db';
import { uploads } from '@/lib/drizzle/schema';
import { uploadFile } from '@/lib/storage';

export async function POST(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const category = (formData.get('category') as string || 'general') as 'profile' | 'document' | 'course_material' | 'course_cover' | 'general';
    const isPublic = formData.get('isPublic') !== 'false'; // Default to true

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Define validation rules per category
    let maxSize = 10 * 1024 * 1024; // 10MB default
    let allowedTypes: string[] | undefined;
    let resize: { width: number; height: number; fit?: 'cover' | 'contain' } | undefined;

    switch (category) {
      case 'profile':
        maxSize = 5 * 1024 * 1024; // 5MB
        allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        resize = { width: 400, height: 400, fit: 'cover' };
        break;

      case 'course_cover':
        maxSize = 5 * 1024 * 1024; // 5MB
        allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        resize = { width: 1200, height: 630, fit: 'cover' };
        break;

      case 'document':
        maxSize = 20 * 1024 * 1024; // 20MB
        allowedTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ];
        break;

      case 'course_material':
        maxSize = 50 * 1024 * 1024; // 50MB
        // Allow various file types for course materials
        break;
    }

    // Upload file using storage provider
    const result = await uploadFile(file, {
      userId: session.user.id,
      category,
      isPublic,
      maxSize,
      allowedTypes,
      resize,
    });

    // Save metadata to database
    const [upload] = await db
      .insert(uploads)
      .values({
        userId: session.user.id,
        fileName: result.fileName,
        originalName: file.name,
        mimeType: result.mimeType,
        fileSize: result.fileSize,
        filePath: result.id, // Store the file key/path
        fileUrl: result.fileUrl,
        storageType: result.storageType,
        category,
        isPublic,
      })
      .returning();

    return NextResponse.json({
      id: upload.id,
      fileName: upload.fileName,
      fileUrl: upload.fileUrl,
      fileSize: upload.fileSize,
      mimeType: upload.mimeType,
    });
  } catch (error) {
    console.error('Upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload file';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
