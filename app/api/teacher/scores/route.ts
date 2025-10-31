import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/drizzle/db';
import { scores, enrollments, courses } from '@/lib/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const createScoreSchema = z.object({
  enrollmentId: z.string().uuid(),
  title: z.string().min(1, 'Title is required'),
  score: z.number().min(0),
  maxScore: z.number().min(1),
  remarks: z.string().nullable().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createScoreSchema.parse(body);

    // Verify the enrollment belongs to teacher's course
    const [enrollment] = await db
      .select({ courseId: enrollments.courseId })
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(
        and(
          eq(enrollments.id, validatedData.enrollmentId),
          eq(courses.teacherId, session.user.id)
        )
      );

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found or unauthorized' },
        { status: 404 }
      );
    }

    // Create the score
    const [newScore] = await db
      .insert(scores)
      .values({
        enrollmentId: validatedData.enrollmentId,
        title: validatedData.title,
        score: validatedData.score,
        maxScore: validatedData.maxScore,
        remarks: validatedData.remarks || null,
        created: new Date(),
      })
      .returning();

    return NextResponse.json(newScore, { status: 201 });
  } catch (error) {
    console.error('Error creating score:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
