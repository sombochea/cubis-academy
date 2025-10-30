import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/drizzle/db';
import { enrollments, courses, users } from '@/lib/drizzle/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'student') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if email is verified
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user?.emailVerifiedAt) {
      return NextResponse.json(
        { 
          error: 'Email verification required',
          code: 'EMAIL_NOT_VERIFIED',
          message: 'Please verify your email address before enrolling in courses.'
        },
        { status: 403 }
      );
    }

    const { courseId } = await req.json();

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Check if already enrolled
    const existing = await db.query.enrollments.findFirst({
      where: and(
        eq(enrollments.studentId, session.user.id),
        eq(enrollments.courseId, courseId)
      ),
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Already enrolled in this course' },
        { status: 409 }
      );
    }

    // Get course details
    const course = await db.query.courses.findFirst({
      where: eq(courses.id, courseId),
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Create enrollment with payment tracking
    const [enrollment] = await db.insert(enrollments).values({
      studentId: session.user.id,
      courseId,
      status: 'active',
      progress: 0,
      totalAmount: course.price || '0',
      paidAmount: '0',
    }).returning();

    return NextResponse.json(
      { 
        message: 'Enrolled successfully',
        enrollmentId: enrollment.id,
        enrollment,
        course 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Enrollment error:', error);
    return NextResponse.json(
      { error: 'Failed to enroll' },
      { status: 500 }
    );
  }
}
