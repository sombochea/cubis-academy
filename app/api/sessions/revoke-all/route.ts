import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { revokeAllUserSessions } from '@/lib/session-store';

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Revoke all sessions for the user
    await revokeAllUserSessions(session.user.id);

    return NextResponse.json({ message: 'All sessions revoked successfully' });
  } catch (error) {
    console.error('Revoke all sessions error:', error);
    return NextResponse.json(
      { error: 'Failed to revoke sessions' },
      { status: 500 }
    );
  }
}
