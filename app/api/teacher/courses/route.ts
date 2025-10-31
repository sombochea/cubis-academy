import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { db } from '@/lib/drizzle/db';
import { courses } from '@/lib/drizzle/schema';
import { z } from 'zod';

// Validation schema
const createCourseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  desc: z.string(),
  category: z.string(),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  price: z.string(),
  duration: z.string(),
  deliveryMode: z.enum(['online', 'face_to_face', 'hybrid']),
  location: z.string(),
  youtubeUrl: z.string(),
  zoomUrl: z.string(),
  isActive: z.boolean(),
});

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createCourseSchema.parse(body);

    // Transform empty strings to null for optional fields
    const courseData = {
      title: validatedData.title,
      desc: validatedData.desc || null,
      category: validatedData.category,
      level: validatedData.level,
      price: validatedData.price || '0',
      duration: validatedData.duration || null,
      deliveryMode: validatedData.deliveryMode,
      location: validatedData.location || null,
      youtubeUrl: validatedData.youtubeUrl || null,
      zoomUrl: validatedData.zoomUrl || null,
      isActive: validatedData.isActive,
      teacherId: session.user.id,
      created: new Date(),
      updated: new Date(),
    };

    // Create course
    const [newCourse] = await db
      .insert(courses)
      .values(courseData)
      .returning({ id: courses.id });

    return NextResponse.json(
      {
        success: true,
        message: 'Course created successfully',
        courseId: newCourse.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create course error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
}
