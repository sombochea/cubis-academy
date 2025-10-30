import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getSession } from '@/lib/session-store';

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { sessionToken } = body;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Session token required' }, { status: 400 });
    }

    // Check if session is still active
    const serverSession = await getSession(sessionToken);

    if (!serverSession) {
      // Check if session was explicitly revoked (exists but inactive)
      const { db } = await import('@/lib/drizzle/db');
      const { userSessions } = await import('@/lib/drizzle/schema');
      const { eq } = await import('drizzle-orm');

      const revokedSession = await db.query.userSessions.findFirst({
        where: eq(userSessions.sessionToken, sessionToken),
        columns: { isActive: true },
      });

      if (revokedSession && !revokedSession.isActive) {
        // Session was explicitly revoked
        return NextResponse.json({ error: 'Session invalid' }, { status: 403 });
      }

      // Session doesn't exist yet (might be initializing)
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Verify session belongs to current user
    if (serverSession.userId !== session.user.id) {
      return NextResponse.json({ error: 'Session mismatch' }, { status: 403 });
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error('Session validation error:', error);
    return NextResponse.json(
      { error: 'Validation failed' },
      { status: 500 }
    );
  }
}
