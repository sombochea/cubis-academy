import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/drizzle/db';
import { courses } from '@/lib/drizzle/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const courseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  desc: z.string().min(10, 'Description must be at least 10 characters'),
  categoryId: z.string().min(1, 'Category is required'),
  teacherId: z.string().optional().transform(val => val === '' ? undefined : val),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format'),
  duration: z.string().regex(/^\d+$/, 'Duration must be a number'),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  youtubeUrl: z.string().optional().transform(val => val === '' ? undefined : val),
  zoomUrl: z.string().optional().transform(val => val === '' ? undefined : val),
  coverImage: z.string().optional().transform(val => val === '' ? undefined : val),
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const validation = courseSchema.safeParse(body);

    if (!validation.success) {
      const errorMessage = validation.error.issues[0]?.message || 'Validation failed';
      console.error('Validation errors:', validation.error.issues);
      return NextResponse.json(
        { error: errorMessage, details: validation.error.issues },
        { status: 400 }
      );
    }

    const { title, desc, categoryId, teacherId, price, duration, level, youtubeUrl, zoomUrl, coverImage } = validation.data;

    const [course] = await db
      .update(courses)
      .set({
        title,
        desc,
        categoryId,
        teacherId: teacherId || null,
        price,
        duration: parseInt(duration),
        level,
        youtubeUrl,
        zoomUrl,
        coverImage,
        updated: new Date(),
      })
      .where(eq(courses.id, id))
      .returning();

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error('Update course error:', error);
    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    await db
      .delete(courses)
      .where(eq(courses.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete course error:', error);
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    );
  }
}
