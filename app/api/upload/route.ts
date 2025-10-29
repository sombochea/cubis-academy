import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { uploadFile } from '@/lib/upload';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string || 'general';
    const isPublic = formData.get('isPublic') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate category
    const validCategories = ['profile', 'document', 'course_material', 'general'];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    // Upload options based on category
    const uploadOptions: any = {
      userId: session.user.id,
      category,
      isPublic,
    };

    // Profile images get resized
    if (category === 'profile') {
      uploadOptions.resize = {
        width: 400,
        height: 400,
        fit: 'cover',
      };
      uploadOptions.allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      uploadOptions.maxSize = 5 * 1024 * 1024; // 5MB
    }

    const result = await uploadFile(file, uploadOptions);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
