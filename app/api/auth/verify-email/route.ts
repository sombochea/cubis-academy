import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/drizzle/db';
import { users } from '@/lib/drizzle/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const verifySchema = z.object({
  code: z.string().length(6, 'Code must be 6 digits'),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = verifySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { code } = validation.data;

    // Get user details
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if already verified
    if (user.emailVerifiedAt) {
      return NextResponse.json(
        { error: 'Email already verified' },
        { status: 400 }
      );
    }

    // TODO: Verify code against stored token
    // For MVP, we'll accept any 6-digit code (development only)
    // In production, verify against stored token with expiration check
    
    if (process.env.NODE_ENV === 'production' && code !== '123456') {
      // In production, implement proper verification
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    // Mark email as verified
    await db.update(users)
      .set({
        emailVerifiedAt: new Date(),
        updated: new Date(),
      })
      .where(eq(users.id, session.user.id));

    return NextResponse.json(
      { 
        message: 'Email verified successfully',
        verified: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verify email error:', error);
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    );
  }
}
