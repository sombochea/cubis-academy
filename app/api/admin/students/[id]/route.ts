import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/drizzle/db';
import { users, students } from '@/lib/drizzle/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const studentUpdateSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
  password: z.string().min(6).optional().or(z.literal('')),
  dob: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  photo: z.string().optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = studentUpdateSchema.parse(body);

    // Update user
    const updateData: any = {
      name: validatedData.name,
      phone: validatedData.phone || null,
    };

    // Only update password if provided and not empty
    if (validatedData.password && validatedData.password.trim().length > 0) {
      updateData.passHash = await bcrypt.hash(validatedData.password, 10);
    }

    await db.update(users)
      .set(updateData)
      .where(eq(users.id, id));

    // Update student profile
    await db.update(students)
      .set({
        dob: validatedData.dob || null,
        gender: validatedData.gender || null,
        address: validatedData.address || null,
        photo: validatedData.photo || null,
      })
      .where(eq(students.userId, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating student:', error);
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues[0]?.message || 'Validation error';
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update student' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Delete student profile (cascade will handle user deletion if configured)
    await db.delete(students).where(eq(students.userId, id));
    await db.delete(users).where(eq(users.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 });
  }
}
