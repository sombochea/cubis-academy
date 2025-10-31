import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/drizzle/db';
import { users, students } from '@/lib/drizzle/schema';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const studentSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(6),
  dob: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  photo: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = studentSchema.parse(body);

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
      role: 'student',
      passHash,
    }).returning();

    // Generate student ID (SUID)
    const year = new Date().getFullYear();
    const count = await db.query.students.findMany();
    const suid = `S${year}${String(count.length + 1).padStart(4, '0')}`;

    // Create student profile
    await db.insert(students).values({
      userId: newUser.id,
      suid,
      dob: validatedData.dob || null,
      gender: validatedData.gender || null,
      address: validatedData.address || null,
      photo: validatedData.photo || null,
    });

    return NextResponse.json({ success: true, userId: newUser.id });
  } catch (error) {
    console.error('Error creating student:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create student' }, { status: 500 });
  }
}
