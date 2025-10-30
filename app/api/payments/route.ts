import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/drizzle/db';
import { payments, enrollments } from '@/lib/drizzle/schema';
import { eq } from 'drizzle-orm';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse FormData
    const formData = await req.formData();
    const enrollmentId = formData.get('enrollmentId') as string;
    const amount = formData.get('amount') as string;
    const method = formData.get('method') as string;
    const notes = formData.get('notes') as string | null;
    const proofFile = formData.get('proof') as File | null;

    // Validate required fields
    if (!amount || !method) {
      return NextResponse.json(
        { error: 'Amount and payment method are required' },
        { status: 400 }
      );
    }

    // Validate enrollmentId is required
    if (!enrollmentId) {
      return NextResponse.json(
        { error: 'Enrollment ID is required. All payments must be linked to an enrollment.' },
        { status: 400 }
      );
    }

    // Validate enrollment exists and belongs to student
    const [enrollment] = await db
      .select()
      .from(enrollments)
      .where(eq(enrollments.id, enrollmentId));

    if (!enrollment) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
    }

    if (enrollment.studentId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Handle file upload if provided
    let proofUrl: string | null = null;
    if (proofFile && proofFile.size > 0) {
      try {
        // Create uploads directory if it doesn't exist
        const uploadsDir = join(process.cwd(), 'public', 'uploads', 'payments');
        await mkdir(uploadsDir, { recursive: true });

        // Generate unique filename
        const fileExt = proofFile.name.split('.').pop();
        const fileName = `${randomUUID()}.${fileExt}`;
        const filePath = join(uploadsDir, fileName);

        // Save file
        const bytes = await proofFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        proofUrl = `/uploads/payments/${fileName}`;
      } catch (uploadError) {
        console.error('File upload error:', uploadError);
        // Continue without proof if upload fails
      }
    }

    // Generate transaction ID
    const txnId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create payment record
    const [payment] = await db
      .insert(payments)
      .values({
        studentId: session.user.id,
        enrollmentId: enrollmentId,
        amount: amount,
        method: method,
        status: 'pending',
        txnId: txnId,
        proofUrl: proofUrl,
        notes: notes || null,
      })
      .returning();

    return NextResponse.json(
      {
        message: 'Payment submitted successfully',
        payment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Payment error:', error);
    return NextResponse.json({ error: 'Failed to submit payment' }, { status: 500 });
  }
}
