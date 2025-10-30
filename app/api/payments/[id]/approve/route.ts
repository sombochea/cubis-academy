import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/drizzle/db';
import { payments } from '@/lib/drizzle/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update payment status to completed
    await db
      .update(payments)
      .set({
        status: 'completed',
        updated: new Date(),
      })
      .where(eq(payments.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Approve payment error:', error);
    return NextResponse.json(
      { error: 'Failed to approve payment' },
      { status: 500 }
    );
  }
}
