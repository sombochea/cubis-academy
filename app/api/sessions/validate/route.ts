import { NextResponse } from 'next/server';
import { validateSession } from '@/lib/session-store';

export async function POST(req: Request) {
  try {
    const { sessionToken } = await req.json();

    if (!sessionToken) {
      return NextResponse.json({ error: 'No session token' }, { status: 400 });
    }

    // Validate session
    const validation = await validateSession(sessionToken);

    if (!validation.valid) {
      console.log('🔒 Session validation failed:', validation.reason);
      return NextResponse.json(
        { error: validation.reason, valid: false },
        { status: 401 }
      );
    }

    return NextResponse.json({ valid: true, userId: validation.userId });
  } catch (error) {
    console.error('Session validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate session', valid: false },
      { status: 500 }
    );
  }
}
