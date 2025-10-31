import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/drizzle/db';
import { attendances, enrollments, courses } from '@/lib/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const attendanceRecordSchema = z.object({
  enrollmentId: z.string().uuid(),
  date: z.string(),
  status: z.enum(['present', 'absent', 'late', 'excused']),
  notes: z.string().nullable().optional(),
});

const createAttendanceSchema = z.object({
  attendanceData: z.array(attendanceRecordSchema),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createAttendanceSchema.parse(body);

    // Verify all enrollments belong to teacher's courses
    for (const record of validatedData.attendanceData) {
      const [enrollment] = await db
        .select({ courseId: enrollments.courseId })
        .from(enrollments)
        .innerJoin(courses, eq(enrollments.courseId, courses.id))
        .where(
          and(
            eq(enrollments.id, record.enrollmentId),
            eq(courses.teacherId, session.user.id)
          )
        );

      if (!enrollment) {
        return NextResponse.json(
          { error: 'Enrollment not found or unauthorized' },
          { status: 404 }
        );
      }
    }

    // Create attendance records
    const newRecords = await db
      .insert(attendances)
      .values(
        validatedData.attendanceData.map((record) => ({
          enrollmentId: record.enrollmentId,
          date: new Date(record.date),
          status: record.status,
          notes: record.notes || null,
        }))
      )
      .returning();

    return NextResponse.json(newRecords, { status: 201 });
  } catch (error) {
    console.error('Error creating attendance:', error);

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
