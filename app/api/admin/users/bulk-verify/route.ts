import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/drizzle/db';
import { users } from '@/lib/drizzle/schema';
import { inArray } from 'drizzle-orm';
import { z } from 'zod';

const bulkVerifySchema = z.object({
  userIds: z.array(z.uuid()).min(1, 'At least one user ID required'),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = bulkVerifySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { userIds } = validation.data;

    // Bulk update email verification
    const result = await db
      .update(users)
      .set({
        emailVerifiedAt: new Date(),
        updated: new Date(),
      })
      .where(inArray(users.id, userIds))
      .returning({ id: users.id, email: users.email });

    return NextResponse.json(
      { 
        message: `Successfully verified ${result.length} user(s)`,
        verifiedUsers: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Bulk verify error:', error);
    return NextResponse.json(
      { error: 'Failed to verify users' },
      { status: 500 }
    );
  }
}
