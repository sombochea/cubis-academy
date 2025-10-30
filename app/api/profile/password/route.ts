import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/drizzle/db';
import { users } from '@/lib/drizzle/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { revokeAllUserSessionsExceptCurrent } from '@/lib/session-store';
import { sendPasswordChangeNotification } from '@/lib/email-notifications';
import { cookies } from 'next/headers';

// Schema for users with existing password
const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Password confirmation is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Schema for OAuth users setting password for first time
const passwordSetSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Password confirmation is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export async function PUT(req: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get current session token
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('authjs.session-token')?.value || 
                        cookieStore.get('__Secure-authjs.session-token')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Session token not found' },
        { status: 401 }
      );
    }

    // Get user from database first to check if they have a password
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has a password (not OAuth-only account)
    const hasPassword = !!user.passHash;

    // Parse and validate request body with appropriate schema
    const body = await req.json();
    const validation = hasPassword 
      ? passwordChangeSchema.safeParse(body)
      : passwordSetSchema.safeParse(body);

    if (!validation.success) {
      const firstError = validation.error.errors[0];
      return NextResponse.json(
        { error: firstError?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = validation.data;

    if (hasPassword) {
      // User has existing password - verify it
      const isValidPassword = await bcrypt.compare(currentPassword, user.passHash!);
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        );
      }

      // Check if new password is same as current
      const isSamePassword = await bcrypt.compare(newPassword, user.passHash!);
      if (isSamePassword) {
        return NextResponse.json(
          { error: 'New password must be different from current password' },
          { status: 400 }
        );
      }
    } else {
      // OAuth user setting password for first time
      // No need to verify current password
      console.log('🔐 OAuth user setting password for first time');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in database
    await db
      .update(users)
      .set({ 
        passHash: hashedPassword,
        updated: new Date(),
      })
      .where(eq(users.id, session.user.id));

    // Revoke all other sessions (keep current session active)
    const revokedCount = await revokeAllUserSessionsExceptCurrent(
      session.user.id,
      sessionToken
    );

    console.log('✅ Password changed successfully:', {
      userId: session.user.id,
      revokedSessions: revokedCount,
    });

    // Send notification email asynchronously
    sendPasswordChangeNotification(session.user.id, revokedCount).catch((error) => {
      console.error('Failed to send password change notification:', error);
    });

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
      revokedSessions: revokedCount,
    });
  } catch (error) {
    console.error('❌ Password change error:', error);
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    );
  }
}
