import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/drizzle/db';
import { payments } from '@/lib/drizzle/schema';

export async function POST(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'student') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { courseId, amount, method, txnId, notes } = await req.json();

    if (!courseId || !amount || !method) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create payment record
    const [payment] = await db.insert(payments).values({
      studentId: session.user.id,
      courseId,
      amount,
      method,
      status: 'pending',
      txnId: txnId || null,
      notes: notes || null,
    }).returning();

    return NextResponse.json(
      { 
        message: 'Payment submitted successfully',
        payment 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Payment error:', error);
    return NextResponse.json(
      { error: 'Failed to submit payment' },
      { status: 500 }
    );
  }
}
