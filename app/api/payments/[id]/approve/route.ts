import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/drizzle/db';
import { payments, enrollments } from '@/lib/drizzle/schema';
import { eq, sql } from 'drizzle-orm';

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await params
    const resolvedParams = await context.params;
    const paymentId = resolvedParams.id;

    // Validate ID
    if (!paymentId) {
      console.error('Payment ID is undefined:', resolvedParams);
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    console.log('Approving payment:', paymentId);

    // Get payment details
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.id, paymentId));

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    if (payment.status !== 'pending') {
      return NextResponse.json(
        { error: 'Payment is not pending' },
        { status: 400 }
      );
    }

    // Start transaction
    await db.transaction(async (tx) => {
      // Update payment status and set approved timestamp
      await tx
        .update(payments)
        .set({ 
          status: 'completed',
          approvedAt: new Date(),
        })
        .where(eq(payments.id, paymentId));

      // Update enrollment paid amount if enrollment exists
      if (payment.enrollmentId) {
        await tx
          .update(enrollments)
          .set({
            paidAmount: sql`${enrollments.paidAmount} + ${payment.amount}`,
          })
          .where(eq(enrollments.id, payment.enrollmentId));
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Approve payment error:', error);
    return NextResponse.json(
      { error: 'Failed to approve payment' },
      { status: 500 }
    );
  }
}
