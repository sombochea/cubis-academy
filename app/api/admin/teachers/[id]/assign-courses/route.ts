import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/drizzle/db';
import { teacherCourses } from '@/lib/drizzle/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const assignCoursesSchema = z.object({
  courseIds: z.array(z.string()),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: teacherId } = await params;
    const body = await request.json();
    const { courseIds } = assignCoursesSchema.parse(body);

    // First, remove all existing assignments for this teacher
    await db.delete(teacherCourses)
      .where(eq(teacherCourses.teacherId, teacherId));

    // Then, create new assignments
    if (courseIds.length > 0) {
      await db.insert(teacherCourses)
        .values(courseIds.map(courseId => ({
          teacherId,
          courseId,
        })));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error assigning courses:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to assign courses' }, { status: 500 });
  }
}
