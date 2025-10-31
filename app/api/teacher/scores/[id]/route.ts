import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/drizzle/db';
import { scores, enrollments, courses } from '@/lib/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const updateScoreSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  score: z.number().min(0),
  maxScore: z.number().min(1),
  remarks: z.string().nullable().optional(),
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

    // Verify the score belongs to teacher's course
    const [existingScore] = await db
      .select({ enrollmentId: scores.enrollmentId })
      .from(scores)
      .innerJoin(enrollments, eq(scores.enrollmentId, enrollments.id))
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(and(eq(scores.id, id), eq(courses.teacherId, session.user.id)));

    if (!existingScore) {
      return NextResponse.json({ error: 'Score not found' }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = updateScoreSchema.parse(body);

    // Update the score
    await db
      .update(scores)
      .set({
        title: validatedData.title,
        score: validatedData.score,
        maxScore: validatedData.maxScore,
        remarks: validatedData.remarks || null,
      })
      .where(eq(scores.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating score:', error);

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

    // Verify the score belongs to teacher's course
    const [existingScore] = await db
      .select({ enrollmentId: scores.enrollmentId })
      .from(scores)
      .innerJoin(enrollments, eq(scores.enrollmentId, enrollments.id))
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(and(eq(scores.id, id), eq(courses.teacherId, session.user.id)));

    if (!existingScore) {
      return NextResponse.json({ error: 'Score not found' }, { status: 404 });
    }

    // Delete the score
    await db.delete(scores).where(eq(scores.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting score:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
