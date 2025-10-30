import { db } from '@/lib/drizzle/db';
import { emailVerificationCodes } from '@/lib/drizzle/schema';
import { eq, and, gt } from 'drizzle-orm';

/**
 * Generate a 6-digit verification code
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Create and store a verification code for email change
 */
export async function createEmailVerificationCode(
  userId: string,
  newEmail: string
): Promise<string> {
  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await db.insert(emailVerificationCodes).values({
    userId,
    email: newEmail,
    code,
    expiresAt,
    verified: false,
  });

  // Log for debugging
  console.log('🔐 Email Verification Code Generated:');
  console.log(`   User ID: ${userId}`);
  console.log(`   New Email: ${newEmail}`);
  console.log(`   Code: ${code}`);
  console.log(`   Expires: ${expiresAt.toISOString()}`);

  return code;
}

/**
 * Verify the code and return the new email if valid
 */
export async function verifyEmailCode(
  userId: string,
  code: string
): Promise<{ success: boolean; email?: string; error?: string }> {
  const now = new Date();

  const verificationRecord = await db
    .select()
    .from(emailVerificationCodes)
    .where(
      and(
        eq(emailVerificationCodes.userId, userId),
        eq(emailVerificationCodes.code, code),
        eq(emailVerificationCodes.verified, false),
        gt(emailVerificationCodes.expiresAt, now)
      )
    )
    .limit(1);

  if (verificationRecord.length === 0) {
    return { success: false, error: 'Invalid or expired verification code' };
  }

  const record = verificationRecord[0];

  // Mark as verified
  await db
    .update(emailVerificationCodes)
    .set({ verified: true })
    .where(eq(emailVerificationCodes.id, record.id));

  console.log('✅ Email Verification Code Verified:');
  console.log(`   User ID: ${userId}`);
  console.log(`   New Email: ${record.email}`);
  console.log(`   Code: ${code}`);

  return { success: true, email: record.email };
}

/**
 * Send verification code via email (placeholder for now)
 */
export async function sendVerificationEmail(
  email: string,
  code: string
): Promise<void> {
  // TODO: Implement with Resend when ready
  console.log('📧 Sending verification email:');
  console.log(`   To: ${email}`);
  console.log(`   Code: ${code}`);
  console.log('   (Email sending not implemented yet - check server logs for code)');
}
