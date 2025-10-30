import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/drizzle/db';
import { enrollments, scores, attendances } from '@/lib/drizzle/schema';
import { eq } from 'drizzle-orm';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete associated scores first
    await db.delete(scores).where(eq(scores.enrollmentId, id));

    // Delete associated attendance records
    await db.delete(attendances).where(eq(attendances.enrollmentId, id));

    // Delete the enrollment
    await db.delete(enrollments).where(eq(enrollments.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete enrollment error:', error);
    return NextResponse.json(
      { error: 'Failed to delete enrollment' },
      { status: 500 }
    );
  }
}
