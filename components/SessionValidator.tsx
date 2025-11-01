"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useParams } from "next/navigation";
import { getDeviceId } from "@/lib/browser-fingerprint";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, ShieldAlert } from "lucide-react";

interface ValidationError {
  reason: string;
  message: string;
  severity: 'warning' | 'critical';
}

/**
 * Component to validate session is still active on server
 * Automatically logs out if session is revoked or device mismatch detected
 */
export function SessionValidator() {
  const { data: session, status } = useSession();
  const params = useParams();
  const locale = (params?.locale as string) || "km";
  const [initialized, setInitialized] = useState(false);
  const [deviceId] = useState(() => getDeviceId());
  const [validationError, setValidationError] = useState<ValidationError | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const token = session.user as any;

      if (token.sessionToken) {
        // Validate session with deviceId check
        const validateSession = async () => {
          try {
            // First validate device ID
            const deviceResponse = await fetch("/api/sessions/validate-device", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ deviceId }),
            });

            const deviceData = await deviceResponse.json();

            if (!deviceResponse.ok && deviceData.shouldLogout) {
              console.warn("🚨 Device validation failed:", deviceData.reason);
              
              // Show security warning dialog
              setValidationError({
                reason: deviceData.reason,
                message: deviceData.message || 'Your session is invalid. Please log in again.',
                severity: deviceData.severity || 'warning',
              });
              return;
            }

            // Then validate session token
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
                setValidationError({
                  reason: 'session_revoked',
                  message: 'Your session has been revoked. Please log in again.',
                  severity: 'warning',
                });
              } else if (initialized) {
                // If we've already validated once and now it's gone, log out
                console.log("🚫 Session disappeared, logging out...");
                setValidationError({
                  reason: 'session_expired',
                  message: 'Your session has expired. Please log in again.',
                  severity: 'warning',
                });
              }
              // Otherwise, session might just be initializing, don't log out
            } else {
              // Session is valid, mark as initialized
              setInitialized(true);
            }
          } catch (error) {
            console.error("❌ Session validation error:", error);
          }
        };

        // Wait 2 seconds before first validation to let SessionInitializer create the session
        const initialTimeout = setTimeout(() => {
          validateSession();
          setInitialized(true);
        }, 2000);

        // Then validate every 3 minutes (more frequent for better security)
        const interval = setInterval(validateSession, 3 * 60 * 1000);

        return () => {
          clearTimeout(initialTimeout);
          clearInterval(interval);
        };
      }
    }
  }, [status, session, locale, initialized, deviceId]);

  const handleLogout = async () => {
    setValidationError(null);
    await signOut({ 
      callbackUrl: `/${locale}/login?reason=${validationError?.reason || 'session_invalid'}` 
    });
  };

  if (!validationError) {
    return null;
  }

  return (
    <AlertDialog open={!!validationError} onOpenChange={() => {}}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {validationError.severity === 'critical' ? (
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <ShieldAlert className="w-6 h-6 text-red-600" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
            )}
            <div>
              <AlertDialogTitle className="text-lg">
                {validationError.severity === 'critical'
                  ? 'Security Alert'
                  : 'Session Expired'}
              </AlertDialogTitle>
            </div>
          </div>
          <AlertDialogDescription className="text-base text-[#363942]">
            {validationError.message}
          </AlertDialogDescription>
          
          {validationError.reason === 'session_hijacking' && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>Security Tip:</strong> If you didn't log in from another device, 
                your account may be compromised. Please change your password immediately 
                after logging in.
              </p>
            </div>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={handleLogout}
            className="bg-gradient-to-r from-[#007FFF] to-[#17224D] hover:opacity-90"
          >
            Log In Again
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
