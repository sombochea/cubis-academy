import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/drizzle/db';
import { users, teachers } from '@/lib/drizzle/schema';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const teacherSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(6),
  bio: z.string().optional(),
  spec: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = teacherSchema.parse(body);

    // Check if email already exists
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, validatedData.email),
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    // Hash password
    const passHash = await bcrypt.hash(validatedData.password, 10);

    // Create user
    const [newUser] = await db.insert(users).values({
      name: validatedData.name,
      email: validatedData.email,
      phone: validatedData.phone || null,
      role: 'teacher',
      passHash,
    }).returning();

    // Create teacher profile
    await db.insert(teachers).values({
      userId: newUser.id,
      bio: validatedData.bio || null,
      spec: validatedData.spec || null,
    });

    return NextResponse.json({ success: true, userId: newUser.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
