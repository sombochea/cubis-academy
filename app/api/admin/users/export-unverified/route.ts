import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/drizzle/db';
import { users, students, teachers } from '@/lib/drizzle/schema';
import { isNull, eq } from 'drizzle-orm';

export async function GET(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role'); // 'student', 'teacher', or null for all

    // Build query based on role filter
    let unverifiedUsers;

    if (role === 'student') {
      unverifiedUsers = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          phone: users.phone,
          created: users.created,
          suid: students.suid,
        })
        .from(users)
        .innerJoin(students, eq(students.userId, users.id))
        .where(isNull(users.emailVerifiedAt));
    } else if (role === 'teacher') {
      unverifiedUsers = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          phone: users.phone,
          created: users.created,
          spec: teachers.spec,
        })
        .from(users)
        .innerJoin(teachers, eq(teachers.userId, users.id))
        .where(isNull(users.emailVerifiedAt));
    } else {
      unverifiedUsers = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          phone: users.phone,
          created: users.created,
        })
        .from(users)
        .where(isNull(users.emailVerifiedAt));
    }

    // Convert to CSV
    const headers = ['ID', 'Name', 'Email', 'Role', 'Phone', 'Created', 'SUID/Spec'];
    const rows = unverifiedUsers.map((user: any) => [
      user.id,
      user.name,
      user.email,
      user.role,
      user.phone || '',
      new Date(user.created).toISOString(),
      user.suid || user.spec || '',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="unverified-users-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export unverified error:', error);
    return NextResponse.json(
      { error: 'Failed to export unverified users' },
      { status: 500 }
    );
  }
}
