/**
 * Pusher Authentication Endpoint
 * 
 * Authenticates users for private and presence channels.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { authenticatePusherChannel } from '@/lib/realtime/pusher';

export async function POST(req: NextRequest) {
  try {
    // Verify user is authenticated
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get Pusher auth parameters
    const formData = await req.formData();
    const socketId = formData.get('socket_id') as string;
    const channelName = formData.get('channel_name') as string;

    if (!socketId || !channelName) {
      return NextResponse.json(
        { error: 'Missing socket_id or channel_name' },
        { status: 400 }
      );
    }

    // Verify user has access to this channel
    const userId = session.user.id;
    const userRole = session.user.role;

    // Check channel access permissions
    if (channelName.includes('private-user-') && !channelName.includes(userId)) {
      return NextResponse.json(
        { error: 'Forbidden: Cannot access other user channels' },
        { status: 403 }
      );
    }

    if (channelName.includes('private-student-') && userRole !== 'student') {
      return NextResponse.json(
        { error: 'Forbidden: Student channels only' },
        { status: 403 }
      );
    }

    if (channelName.includes('private-teacher-') && userRole !== 'teacher') {
      return NextResponse.json(
        { error: 'Forbidden: Teacher channels only' },
        { status: 403 }
      );
    }

    if (channelName.includes('private-admin-') && userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin channels only' },
        { status: 403 }
      );
    }

    // Authenticate with Pusher
    const authResponse = authenticatePusherChannel(socketId, channelName, userId);

    if (!authResponse) {
      return NextResponse.json(
        { error: 'Pusher authentication failed' },
        { status: 500 }
      );
    }

    return NextResponse.json(authResponse);
  } catch (error) {
    console.error('[Pusher Auth] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
