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
    const { deviceId } = body;

    if (!deviceId) {
      return NextResponse.json({ error: 'Device ID required' }, { status: 400 });
    }

    // Get current session token
    const currentSessionToken = (session.user as any).sessionToken;

    if (!currentSessionToken) {
      return NextResponse.json({ error: 'No session token' }, { status: 401 });
    }

    // Get session from database
    const dbSession = await getSession(currentSessionToken);

    if (!dbSession) {
      return NextResponse.json({ 
        valid: false, 
        reason: 'Session not found' 
      }, { status: 403 });
    }

    // Check if deviceId matches
    if (dbSession.deviceId && dbSession.deviceId !== deviceId) {
      console.warn('🚨 SECURITY ALERT - Device ID mismatch detected!', {
        userId: session.user.id,
        userName: session.user.name,
        expectedDeviceId: dbSession.deviceId.substring(0, 8) + '...',
        receivedDeviceId: deviceId.substring(0, 8) + '...',
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json({ 
        valid: false, 
        reason: 'session_hijacking',
        message: 'Your session is being used on another device. For security reasons, you have been logged out.',
        shouldLogout: true,
        severity: 'critical'
      }, { status: 403 });
    }

    // Check if session token matches (additional security layer)
    if (dbSession.sessionToken !== currentSessionToken) {
      console.warn('🚨 SECURITY ALERT - Session token mismatch!', {
        userId: session.user.id,
        userName: session.user.name,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json({ 
        valid: false, 
        reason: 'session_token_mismatch',
        message: 'Your session token is invalid. Please log in again.',
        shouldLogout: true,
        severity: 'critical'
      }, { status: 403 });
    }

    // Check if session has expired
    if (dbSession.expiresAt && new Date(dbSession.expiresAt) < new Date()) {
      return NextResponse.json({ 
        valid: false, 
        reason: 'session_expired',
        message: 'Your session has expired. Please log in again.',
        shouldLogout: true,
        severity: 'warning'
      }, { status: 401 });
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error('Session device validation error:', error);
    return NextResponse.json(
      { error: 'Validation failed' },
      { status: 500 }
    );
  }
}
