import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createSession, getSession } from '@/lib/session-store';

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = session.user as any;
    const sessionToken = token.sessionToken;

    if (!sessionToken) {
      return NextResponse.json({ error: 'No session token' }, { status: 400 });
    }

    // Verify user exists in database before creating session
    const { db } = await import('@/lib/drizzle/db');
    const { users } = await import('@/lib/drizzle/schema');
    const { eq } = await import('drizzle-orm');
    
    const userExists = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      columns: { id: true },
    });

    if (!userExists) {
      console.error('❌ User not found in database:', session.user.id);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get request body for deviceId and login method
    const body = await req.json().catch(() => ({}));
    const deviceId = body.deviceId;
    const loginMethod = body.loginMethod; // 'credentials' or 'google'

    // Check if session exists (active sessions only)
    const existingSession = await getSession(sessionToken);

    if (!existingSession) {
      // Check if this session already exists in database (active or inactive)
      const { userSessions } = await import('@/lib/drizzle/schema');
      const dbSession = await db.query.userSessions.findFirst({
        where: eq(userSessions.sessionToken, sessionToken),
      });

      // If session exists but is inactive (revoked), don't recreate it
      if (dbSession && !dbSession.isActive) {
        console.log('🚫 Session was revoked, not recreating:', sessionToken.substring(0, 10) + '...');
        return NextResponse.json({ error: 'Session revoked' }, { status: 403 });
      }

      // If session exists and is active, it's in DB but not in cache - just return success
      if (dbSession && dbSession.isActive) {
        console.log('✅ Session exists in DB, returning success:', sessionToken.substring(0, 10) + '...');
        return NextResponse.json({ exists: true });
      }

      // Session doesn't exist at all - create it
      const userAgent = req.headers.get('user-agent') || undefined;
      const ipAddress =
        req.headers.get('x-forwarded-for')?.split(',')[0] ||
        req.headers.get('x-real-ip') ||
        undefined;

      // Use provided login method (from JWT token)
      const finalLoginMethod: 'credentials' | 'google' | 'oauth' = loginMethod || 'credentials';

      await createSession({
        userId: session.user.id,
        sessionToken,
        deviceId,
        ipAddress,
        userAgent,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        loginMethod: finalLoginMethod,
      });

      console.log('✅ Session created for user:', session.user.id, 'deviceId:', deviceId, 'method:', finalLoginMethod);
      return NextResponse.json({ created: true });
    }

    // Session exists - check if it needs device_id update
    if (existingSession && !existingSession.deviceId && deviceId) {
      console.log('⚠️ Session exists without device_id, updating...');
      
      // Update session with device_id
      await createSession({
        userId: session.user.id,
        sessionToken,
        deviceId,
        ipAddress: existingSession.ipAddress || undefined,
        userAgent: existingSession.userAgent || undefined,
        expiresAt: existingSession.expiresAt,
      });

      console.log('✅ Session updated with deviceId:', deviceId);
      return NextResponse.json({ updated: true });
    }

    return NextResponse.json({ exists: true });
  } catch (error) {
    console.error('Session ensure error:', error);
    return NextResponse.json({ error: 'Failed to ensure session' }, { status: 500 });
  }
}
