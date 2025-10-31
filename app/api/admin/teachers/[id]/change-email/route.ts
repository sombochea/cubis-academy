import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/drizzle/db';
import { users } from '@/lib/drizzle/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const changeEmailSchema = z.object({
  newEmail: z.string().email('Invalid email address'),
  markVerified: z.boolean().optional(),
});

export async function POST(
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
    const { newEmail, markVerified } = changeEmailSchema.parse(body);

    // Check if email already exists
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, newEmail),
    });

    if (existingUser && existingUser.id !== id) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }

    // Update email
    await db.update(users)
      .set({ 
        email: newEmail,
        emailVerifiedAt: markVerified ? new Date() : null,
        updated: new Date(),
      })
      .where(eq(users.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error changing email:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to change email' }, { status: 500 });
  }
}
