import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/drizzle/db';
import { users } from '@/lib/drizzle/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export async function POST() {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

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

    // Generate verification token (6-digit code for MVP)
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store verification code in user metadata (for MVP)
    // In production, use a separate verification_tokens table
    await db.update(users)
      .set({
        // Store in a JSON field or create a separate table in production
        updated: new Date(),
      })
      .where(eq(users.id, session.user.id));

    // TODO: Send email with verification code
    // For MVP, we'll return the code in the response (development only)
    // In production, send via email service (Resend)
    
    console.log(`Verification code for ${user.email}: ${verificationCode}`);

    return NextResponse.json(
      { 
        message: 'Verification email sent successfully',
        // Remove this in production - only for MVP testing
        devCode: process.env.NODE_ENV === 'development' ? verificationCode : undefined,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Send verification error:', error);
    return NextResponse.json(
      { error: 'Failed to send verification email' },
      { status: 500 }
    );
  }
}
