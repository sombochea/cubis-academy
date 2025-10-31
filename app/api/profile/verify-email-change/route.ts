import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/drizzle/db';
import { users, students, teachers } from '@/lib/drizzle/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { verifyEmailCode } from '@/lib/email-verification';

const verifySchema = z.object({
  code: z.string().length(6, 'Code must be 6 digits'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  photo: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validation = verifySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { code, name, phone, photo } = validation.data;

    // Verify the code
    const verificationResult = await verifyEmailCode(session.user.id, code);

    if (!verificationResult.success) {
      return NextResponse.json(
        { error: verificationResult.error },
        { status: 400 }
      );
    }

    const newEmail = verificationResult.email!;

    // Update user table with new email
    await db
      .update(users)
      .set({
        name,
        email: newEmail,
        phone,
        emailVerifiedAt: new Date(), // Mark email as verified
        updated: new Date(),
      })
      .where(eq(users.id, session.user.id));

    // Update role-specific table if photo is provided
    if (photo) {
      if (session.user.role === 'student') {
        await db
          .update(students)
          .set({ photo })
          .where(eq(students.userId, session.user.id));
      } else if (session.user.role === 'teacher') {
        await db
          .update(teachers)
          .set({ photo })
          .where(eq(teachers.userId, session.user.id));
      }
    }

    return NextResponse.json({
      message: 'Email changed successfully',
      user: { name, email: newEmail, phone },
    });
  } catch (error) {
    console.error('Verify email change error:', error);
    return NextResponse.json(
      { error: 'Failed to verify email change' },
      { status: 500 }
    );
  }
}
