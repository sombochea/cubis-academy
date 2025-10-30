'use client';

import { useEffect } from 'react';

/**
 * Hook to ensure user session is created in our session store
 * This is needed because middleware can't use Node.js modules in edge runtime
 */
export function useEnsureSession() {
  useEffect(() => {
    // Call API to ensure session exists
    fetch('/api/sessions/ensure', {
      method: 'POST',
    }).catch((error) => {
      console.error('Failed to ensure session:', error);
    });
  }, []);
}
