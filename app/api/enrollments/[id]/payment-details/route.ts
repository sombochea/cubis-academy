import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/drizzle/db';
import { enrollments, courses } from '@/lib/drizzle/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get enrollment with course details
    const [enrollment] = await db
      .select({
        id: enrollments.id,
        studentId: enrollments.studentId,
        totalAmount: enrollments.totalAmount,
        paidAmount: enrollments.paidAmount,
        courseTitle: courses.title,
        courseCategory: courses.category,
      })
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(and(eq(enrollments.id, id), eq(enrollments.studentId, session.user.id)));

    if (!enrollment) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
    }

    return NextResponse.json({
      totalAmount: enrollment.totalAmount,
      paidAmount: enrollment.paidAmount,
      courseTitle: enrollment.courseTitle,
      courseCategory: enrollment.courseCategory,
    });
  } catch (error) {
    console.error('Error fetching enrollment payment details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enrollment details' },
      { status: 500 }
    );
  }
}
