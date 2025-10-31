import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/drizzle/db';
import { users, emailVerificationCodes } from '@/lib/drizzle/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import {
  createEmailVerificationCode,
  sendVerificationEmail,
} from '@/lib/email-verification';

const requestSchema = z.object({
  newEmail: z.string().email('Invalid email address'),
});

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validation = requestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { newEmail } = validation.data;

    // Check if email is already taken
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, newEmail))
      .limit(1);

    if (existingUser.length > 0 && existingUser[0].id !== session.user.id) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 409 }
      );
    }

    // Generate and store verification code
    const code = await createEmailVerificationCode(session.user.id, newEmail);

    // Send email (logs to console for now)
    await sendVerificationEmail(newEmail, code);

    return NextResponse.json({
      message: 'Verification code sent to your new email address',
      email: newEmail,
    });
  } catch (error) {
    console.error('Request email change error:', error);
    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    );
  }
}
