import { NextResponse } from 'next/server';
import { registerSchema } from '@/lib/validations/auth';
import { db } from '@/lib/drizzle/db';
import { users, students } from '@/lib/drizzle/schema';
import { generateSuid } from '@/lib/drizzle/queries';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = registerSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validated.error.issues },
        { status: 400 }
      );
    }

    const { name, email, phone, password, dob, gender, address } = validated.data;

    // Check if user exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const passHash = await bcrypt.hash(password, 10);

    // Create user
    const [newUser] = await db.insert(users).values({
      name,
      email,
      phone,
      passHash,
      role: 'student',
      isActive: true,
    }).returning();

    // Generate SUID and create student profile
    const suid = await generateSuid();
    await db.insert(students).values({
      userId: newUser.id,
      suid,
      dob: dob || null,
      gender: gender || null,
      address: address || null,
    });

    return NextResponse.json(
      { message: 'Registration successful', suid },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
