import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/drizzle/db';
import { students, users } from '@/lib/drizzle/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const profileSetupSchema = z.object({
  dob: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  skipOnboarding: z.boolean().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validation = profileSetupSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { dob, gender, address, phone, skipOnboarding } = validation.data;

    // Update student profile
    await db
      .update(students)
      .set({
        dob: dob || null,
        gender: gender || null,
        address: address || null,
        onboardingCompleted: true, // Mark onboarding as complete
      })
      .where(eq(students.userId, session.user.id));

    // Update user phone if provided
    if (phone) {
      await db
        .update(users)
        .set({ phone })
        .where(eq(users.id, session.user.id));
    }

    return NextResponse.json({ 
      success: true,
      message: skipOnboarding ? 'Onboarding skipped' : 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Profile setup error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
