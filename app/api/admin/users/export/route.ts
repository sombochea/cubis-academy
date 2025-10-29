import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/drizzle/db';
import { users, students, teachers } from '@/lib/drizzle/schema';
import { isNull, isNotNull, eq, and, or } from 'drizzle-orm';

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
    const role = searchParams.get('role'); // 'student', 'teacher', 'admin', or null for all
    const status = searchParams.get('status'); // 'verified', 'unverified', or null for all

    // Build where conditions
    const conditions = [];

    // Role filter
    if (role && role !== 'all') {
      conditions.push(eq(users.role, role));
    }

    // Verification status filter
    if (status === 'verified') {
      conditions.push(isNotNull(users.emailVerifiedAt));
    } else if (status === 'unverified') {
      conditions.push(isNull(users.emailVerifiedAt));
    }

    // Combine conditions
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Fetch users based on role for additional data
    let exportData;

    if (role === 'student') {
      exportData = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          phone: users.phone,
          isActive: users.isActive,
          emailVerifiedAt: users.emailVerifiedAt,
          created: users.created,
          suid: students.suid,
          gender: students.gender,
        })
        .from(users)
        .innerJoin(students, eq(students.userId, users.id))
        .where(whereClause);
    } else if (role === 'teacher') {
      exportData = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          phone: users.phone,
          isActive: users.isActive,
          emailVerifiedAt: users.emailVerifiedAt,
          created: users.created,
          spec: teachers.spec,
        })
        .from(users)
        .innerJoin(teachers, eq(teachers.userId, users.id))
        .where(whereClause);
    } else {
      // All roles or admin only
      exportData = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          phone: users.phone,
          isActive: users.isActive,
          emailVerifiedAt: users.emailVerifiedAt,
          created: users.created,
        })
        .from(users)
        .where(whereClause);
    }

    // Convert to CSV
    const headers = [
      'ID',
      'Name',
      'Email',
      'Role',
      'Phone',
      'Status',
      'Email Verified',
      'Verified At',
      'Created',
      'Additional Info',
    ];

    const rows = exportData.map((user: any) => {
      const additionalInfo = user.suid || user.spec || user.gender || '-';
      const emailVerified = user.emailVerifiedAt ? 'Yes' : 'No';
      const verifiedAt = user.emailVerifiedAt 
        ? new Date(user.emailVerifiedAt).toISOString()
        : '-';
      const status = user.isActive ? 'Active' : 'Inactive';

      return [
        user.id,
        user.name,
        user.email,
        user.role,
        user.phone || '-',
        status,
        emailVerified,
        verifiedAt,
        new Date(user.created).toISOString(),
        additionalInfo,
      ];
    });

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    // Generate filename
    const statusLabel = status || 'all';
    const roleLabel = role || 'all-roles';
    const filename = `users-${statusLabel}-${roleLabel}-${new Date().toISOString().split('T')[0]}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Export users error:', error);
    return NextResponse.json(
      { error: 'Failed to export users' },
      { status: 500 }
    );
  }
}
