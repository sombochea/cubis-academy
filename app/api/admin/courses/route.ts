import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/drizzle/db';
import { courses } from '@/lib/drizzle/schema';
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

export async function POST(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = courseSchema.safeParse(body);

    if (!validation.success) {
      const errorMessage = validation.error.errors[0]?.message || 'Validation failed';
      console.error('Validation errors:', validation.error.errors);
      return NextResponse.json(
        { error: errorMessage, details: validation.error.errors },
        { status: 400 }
      );
    }

    const { title, desc, categoryId, teacherId, price, duration, level, youtubeUrl, zoomUrl, coverImage } = validation.data;

    const [course] = await db
      .insert(courses)
      .values({
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
      })
      .returning();

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error('Create course error:', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
}
