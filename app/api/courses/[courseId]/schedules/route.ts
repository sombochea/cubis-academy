import { auth } from '@/auth';
import { db } from '@/lib/drizzle/db';
import { classSchedules } from '@/lib/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const scheduleSchema = z.object({
  dayOfWeek: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
  startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  endTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  location: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

// GET - Get all schedules for a course
export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await auth();
    const { courseId } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admin and teachers can view schedules
    if (session.user.role !== 'admin' && session.user.role !== 'teacher') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const schedules = await db
      .select()
      .from(classSchedules)
      .where(eq(classSchedules.courseId, courseId))
      .orderBy(classSchedules.dayOfWeek);

    return NextResponse.json(schedules);
  } catch (error) {
    console.error('Get schedules error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedules' },
      { status: 500 }
    );
  }
}

// POST - Create a new schedule
export async function POST(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await auth();
    const { courseId } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admin and teachers can create schedules
    if (session.user.role !== 'admin' && session.user.role !== 'teacher') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = scheduleSchema.parse(body);

    // Validate time range
    if (validatedData.startTime >= validatedData.endTime) {
      return NextResponse.json(
        { error: 'End time must be after start time' },
        { status: 400 }
      );
    }

    const [newSchedule] = await db
      .insert(classSchedules)
      .values({
        courseId,
        dayOfWeek: validatedData.dayOfWeek,
        startTime: validatedData.startTime,
        endTime: validatedData.endTime,
        location: validatedData.location || null,
        notes: validatedData.notes || null,
        isActive: validatedData.isActive,
      })
      .returning();

    return NextResponse.json(newSchedule, { status: 201 });
  } catch (error) {
    console.error('Create schedule error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create schedule' },
      { status: 500 }
    );
  }
}
