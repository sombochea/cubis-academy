import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/drizzle/db';
import { courses } from '@/lib/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const updateCourseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  desc: z.any().transform(val => val?.toString() || null),
  category: z.any().transform(val => val?.toString() || null),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  price: z.any().transform(val => val?.toString() || null),
  duration: z.any().transform(val => val?.toString() || null),
  deliveryMode: z.enum(['online', 'face_to_face', 'hybrid']).optional(),
  location: z.any().transform(val => val?.toString() || null),
  youtubeUrl: z.any().transform(val => {
    const str = val?.toString() || '';
    return str === '' ? null : str;
  }),
  zoomUrl: z.any().transform(val => {
    const str = val?.toString() || '';
    return str === '' ? null : str;
  }),
  isActive: z.boolean(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user || session.user.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the course belongs to the teacher
    const [existingCourse] = await db
      .select({ id: courses.id })
      .from(courses)
      .where(and(eq(courses.id, id), eq(courses.teacherId, session.user.id)));

    if (!existingCourse) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = updateCourseSchema.parse(body);

    // Update the course
    await db
      .update(courses)
      .set({
        title: validatedData.title,
        desc: validatedData.desc,
        category: validatedData.category,
        level: validatedData.level,
        price: validatedData.price,
        duration: validatedData.duration,
        deliveryMode: validatedData.deliveryMode || null,
        location: validatedData.location,
        youtubeUrl: validatedData.youtubeUrl,
        zoomUrl: validatedData.zoomUrl,
        isActive: validatedData.isActive,
        updated: new Date(),
      })
      .where(eq(courses.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating course:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user || session.user.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the course belongs to the teacher
    const [existingCourse] = await db
      .select({ id: courses.id })
      .from(courses)
      .where(and(eq(courses.id, id), eq(courses.teacherId, session.user.id)));

    if (!existingCourse) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Soft delete by setting isActive to false
    await db
      .update(courses)
      .set({
        isActive: false,
        updated: new Date(),
      })
      .where(eq(courses.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
