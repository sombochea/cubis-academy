import { auth } from '@/auth';
import { db } from '@/lib/drizzle/db';
import { courseFeedback, enrollments } from '@/lib/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const feedbackSchema = z.object({
  enrollmentId: z.uuid(),
  courseId: z.uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().nullable().optional(),
  isAnonymous: z.boolean().default(false),
  feedbackId: z.uuid().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = feedbackSchema.parse(body);

    // Verify enrollment belongs to user
    const [enrollment] = await db
      .select()
      .from(enrollments)
      .where(
        and(
          eq(enrollments.id, validatedData.enrollmentId),
          eq(enrollments.studentId, session.user.id)
        )
      );

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    // Check if feedback already exists
    const [existing] = await db
      .select()
      .from(courseFeedback)
      .where(eq(courseFeedback.enrollmentId, validatedData.enrollmentId));

    if (existing) {
      return NextResponse.json(
        { error: 'Feedback already submitted. Use PUT to update.' },
        { status: 400 }
      );
    }

    // Create feedback
    const [newFeedback] = await db
      .insert(courseFeedback)
      .values({
        enrollmentId: validatedData.enrollmentId,
        studentId: session.user.id,
        courseId: validatedData.courseId,
        rating: validatedData.rating,
        comment: validatedData.comment || null,
        isAnonymous: validatedData.isAnonymous,
      })
      .returning();

    return NextResponse.json(newFeedback, { status: 201 });
  } catch (error) {
    console.error('Course feedback error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = feedbackSchema.parse(body);

    if (!validatedData.feedbackId) {
      return NextResponse.json(
        { error: 'Feedback ID required for update' },
        { status: 400 }
      );
    }

    // Verify feedback belongs to user
    const [existing] = await db
      .select()
      .from(courseFeedback)
      .where(
        and(
          eq(courseFeedback.id, validatedData.feedbackId),
          eq(courseFeedback.studentId, session.user.id)
        )
      );

    if (!existing) {
      return NextResponse.json(
        { error: 'Feedback not found' },
        { status: 404 }
      );
    }

    // Update feedback
    const [updated] = await db
      .update(courseFeedback)
      .set({
        rating: validatedData.rating,
        comment: validatedData.comment || null,
        isAnonymous: validatedData.isAnonymous,
        updated: new Date(),
      })
      .where(eq(courseFeedback.id, validatedData.feedbackId))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Course feedback update error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update feedback' },
      { status: 500 }
    );
  }
}
