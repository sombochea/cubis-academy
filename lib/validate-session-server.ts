import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { validateSession } from './session-store';

/**
 * Server-side session validation
 * Call this in server components to ensure session is valid
 */
export async function validateSessionServer(locale: string = 'km') {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/${locale}/login`);
  }

  const token = session.user as any;
  const sessionToken = token.sessionToken;

  // If no session token, this is an old JWT
  if (!sessionToken) {
    console.log('🔒 No session token found, redirecting to logout');
    redirect(`/${locale}/logout?reason=no_token`);
  }

  // Validate session in our store
  try {
    const validation = await validateSession(sessionToken);

    if (!validation.valid) {
      console.log('🔒 Session invalid:', validation.reason);
      
      // Determine reason for better UX
      const reason = validation.reason?.includes('revoked') ? 'revoked' : 'session_invalid';
      redirect(`/${locale}/logout?reason=${reason}`);
    }

    return { session, userId: validation.userId };
  } catch (error) {
    console.error('Session validation error:', error);
    redirect(`/${locale}/logout?reason=session_invalid`);
  }
}
