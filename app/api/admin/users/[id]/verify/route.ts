import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/drizzle/db';
import { users } from '@/lib/drizzle/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Get user
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.emailVerifiedAt) {
      return NextResponse.json(
        { error: 'Email already verified' },
        { status: 400 }
      );
    }

    // Verify email
    await db
      .update(users)
      .set({
        emailVerifiedAt: new Date(),
        updated: new Date(),
      })
      .where(eq(users.id, id));

    return NextResponse.json(
      { 
        message: 'Email verified successfully',
        userId: id,
        email: user.email,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Manual verify error:', error);
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Get user
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.emailVerifiedAt) {
      return NextResponse.json(
        { error: 'Email not verified' },
        { status: 400 }
      );
    }

    // Revoke verification
    await db
      .update(users)
      .set({
        emailVerifiedAt: null,
        updated: new Date(),
      })
      .where(eq(users.id, id));

    return NextResponse.json(
      { 
        message: 'Email verification revoked',
        userId: id,
        email: user.email,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Revoke verification error:', error);
    return NextResponse.json(
      { error: 'Failed to revoke verification' },
      { status: 500 }
    );
  }
}
