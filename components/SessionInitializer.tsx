'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { getDeviceId } from '@/lib/browser-fingerprint';

/**
 * Component to initialize user session in database/cache
 * Must be included in authenticated layouts
 */
export function SessionInitializer() {
  const { data: session, status } = useSession();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Only run once when session is authenticated
    if (status === 'authenticated' && session?.user && !initialized) {
      const token = session.user as any;
      
      if (token.sessionToken) {
        // Get persistent device ID from browser
        const deviceId = getDeviceId();
        
        // Call API to ensure session exists in database/cache
        fetch('/api/sessions/ensure', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ deviceId }),
        })
          .then((res) => {
            if (res.ok) {
              console.log('✅ Session initialized in store with deviceId:', deviceId);
              setInitialized(true);
            }
          })
          .catch((error) => {
            console.error('Failed to initialize session:', error);
          });
      }
    }
  }, [status, session, initialized]);

  return null; // This component doesn't render anything
}
