import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/drizzle/db';
import { users, teachers } from '@/lib/drizzle/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const teacherUpdateSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
  bio: z.string().optional(),
  spec: z.string().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = teacherUpdateSchema.parse(body);

    // Update user
    await db.update(users)
      .set({
        name: validatedData.name,
        phone: validatedData.phone || null,
        updated: new Date(),
      })
      .where(eq(users.id, id));

    // Update teacher profile
    await db.update(teachers)
      .set({
        bio: validatedData.bio || null,
        spec: validatedData.spec || null,
      })
      .where(eq(teachers.userId, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Delete the user (cascade will handle teacher profile)
    await db.delete(users).where(eq(users.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
