import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/drizzle/db';
import { courses } from '@/lib/drizzle/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const courseSchema = z.object({
  title: z.string().min(3),
  desc: z.string().optional(),
  category: z.string().optional(),
  teacherId: z.string().optional(),
  price: z.string(),
  duration: z.string(),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  youtubeUrl: z.string().optional(),
  zoomUrl: z.string().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = courseSchema.parse(body);

    await db.update(courses)
      .set({
        title: validatedData.title,
        desc: validatedData.desc || null,
        category: validatedData.category || null,
        teacherId: (validatedData.teacherId && validatedData.teacherId !== 'none') ? validatedData.teacherId : null,
        price: validatedData.price,
        duration: parseInt(validatedData.duration),
        level: validatedData.level,
        youtubeUrl: validatedData.youtubeUrl || null,
        zoomUrl: validatedData.zoomUrl || null,
        updated: new Date(),
      })
      .where(eq(courses.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Delete the course (cascade will handle related records)
    await db.delete(courses).where(eq(courses.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
