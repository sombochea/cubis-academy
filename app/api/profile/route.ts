import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/drizzle/db';
import { users, students, teachers } from '@/lib/drizzle/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  photo: z.string().optional(),
});

export async function PUT(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = profileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { name, email, phone, photo } = validation.data;

    // Check if email is already taken by another user
    if (email !== session.user.email) {
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingUser.length > 0 && existingUser[0].id !== session.user.id) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 409 }
        );
      }
    }

    // Update user table
    const updateData: any = {
      name,
      email,
      phone,
      updated: new Date(),
    };

    // If email is being changed, reset email verification
    if (email !== session.user.email) {
      updateData.emailVerifiedAt = null;
    }

    await db
      .update(users)
      .set(updateData)
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
      message: 'Profile updated successfully',
      user: { name, email, phone }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
