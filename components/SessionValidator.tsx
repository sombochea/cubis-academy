"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useParams } from "next/navigation";

/**
 * Component to validate session is still active on server
 * Automatically logs out if session is revoked
 */
export function SessionValidator() {
  const { data: session, status } = useSession();
  const params = useParams();
  const locale = (params?.locale as string) || "km";
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const token = session.user as any;

      if (token.sessionToken) {
        // Validate session every 30 seconds
        const validateSession = async () => {
          try {
            const response = await fetch("/api/sessions/validate", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ sessionToken: token.sessionToken }),
            });

            const data = await response.json();

            if (!response.ok) {
              // Only log out if session is explicitly revoked (403)
              // Don't log out if session just doesn't exist yet (404)
              if (response.status === 403 && data.error === "Session invalid") {
                console.log("🚫 Session revoked, logging out...");
                await signOut({
                  callbackUrl: `/${locale}/login?reason=session_revoked`,
                });
              } else if (initialized) {
                // If we've already validated once and now it's gone, log out
                console.log("🚫 Session disappeared, logging out...");
                await signOut({
                  callbackUrl: `/${locale}/login?reason=session_expired`,
                });
              }
              // Otherwise, session might just be initializing, don't log out
            } else {
              // Session is valid, mark as initialized
              setInitialized(true);
            }
          } catch (error) {
            console.error("Session validation error:", error);
          }
        };

        // Wait 2 seconds before first validation to let SessionInitializer create the session
        const initialTimeout = setTimeout(() => {
          validateSession();
          setInitialized(true);
        }, 2000);

        // Then validate every 30 seconds
        const interval = setInterval(validateSession, 30000);

        return () => {
          clearTimeout(initialTimeout);
          clearInterval(interval);
        };
      }
    }
  }, [status, session, locale, initialized]);

  return null; // This component doesn't render anything
}
