import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getUserSessions } from '@/lib/session-store';
import { db } from '@/lib/drizzle/db';
import { users } from '@/lib/drizzle/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current session token
    const cookieStore = await cookies();
    const currentSessionToken = cookieStore.get('authjs.session-token')?.value || 
                                cookieStore.get('__Secure-authjs.session-token')?.value;

    // Get all sessions
    const sessions = await getUserSessions(session.user.id);

    // Mark current session and check each session's login method
    const sessionsWithInfo = sessions.map(s => ({
      ...s,
      isCurrent: s.sessionToken === currentSessionToken,
      // Check if this specific session was created via OAuth
      // loginMethod is stored in the session data
      isOAuth: (s as any).loginMethod === 'google' || (s as any).loginMethod === 'oauth',
    }));

    return NextResponse.json({ sessions: sessionsWithInfo });
  } catch (error) {
    console.error('Get sessions error:', error);
    return NextResponse.json(
      { error: 'Failed to get sessions' },
      { status: 500 }
    );
  }
}
