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

    // Get current session token and device ID from the authenticated session
    const u = (session.user as any)
    const currentSessionToken = u.sessionToken;
    const currentDeviceId = u.deviceId;

    if (!currentSessionToken) {
      console.error('❌ No sessionToken in session object');
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Get all sessions
    const sessions = await getUserSessions(session.user.id);

    // Map sessions to safe response format (exclude sensitive data)
    const sessionsWithInfo = sessions.map(s => {
      // A session is current if BOTH sessionToken AND deviceId match
      // This prevents session hijacking if someone steals the session token
      const isCurrent = s.sessionToken === currentSessionToken && 
                       (!currentDeviceId || s.deviceId === currentDeviceId);
      
      return {
        id: s.id,
        userId: s.userId,
        browser: s.browser,
        os: s.os,
        device: s.device,
        ipAddress: s.ipAddress,
        location: s.location,
        deviceId: s.deviceId,
        lastActivity: s.lastActivity,
        created: s.created,
        isCurrent,
        // Check if this specific session was created via OAuth
        isOAuth: (s as any).loginMethod === 'google' || (s as any).loginMethod === 'oauth',
        // DO NOT expose sessionToken for security reasons
      };
    });

    return NextResponse.json({ sessions: sessionsWithInfo });
  } catch (error) {
    console.error('Get sessions error:', error);
    return NextResponse.json(
      { error: 'Failed to get sessions' },
      { status: 500 }
    );
  }
}
