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

    // Get request body for deviceId
    const body = await req.json().catch(() => ({}));
    const deviceId = body.deviceId;

    // Check if session exists
    const existingSession = await getSession(sessionToken);

    if (!existingSession) {
      // Create session
      const userAgent = req.headers.get('user-agent') || undefined;
      const ipAddress =
        req.headers.get('x-forwarded-for')?.split(',')[0] ||
        req.headers.get('x-real-ip') ||
        undefined;

      await createSession({
        userId: session.user.id,
        sessionToken,
        deviceId,
        ipAddress,
        userAgent,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      });

      console.log('✅ Session created for user:', session.user.id, 'deviceId:', deviceId);
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
