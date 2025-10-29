import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/drizzle/db';
import { courses } from '@/lib/drizzle/schema';
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

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = courseSchema.parse(body);

    const [newCourse] = await db.insert(courses).values({
      title: validatedData.title,
      desc: validatedData.desc || null,
      category: validatedData.category || null,
      teacherId: (validatedData.teacherId && validatedData.teacherId !== 'none') ? validatedData.teacherId : null,
      price: validatedData.price,
      duration: parseInt(validatedData.duration),
      level: validatedData.level,
      youtubeUrl: validatedData.youtubeUrl || null,
      zoomUrl: validatedData.zoomUrl || null,
    }).returning();

    return NextResponse.json({ success: true, courseId: newCourse.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
