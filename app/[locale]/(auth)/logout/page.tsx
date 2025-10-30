"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";
import { useParams, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function LogoutPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params.locale as string) || "km";
  const reason = searchParams.get("reason");

  useEffect(() => {
    // Sign out and redirect to login
    signOut({
      callbackUrl: `/${locale}/login`,
      redirect: true,
    });
  }, [locale]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#007FFF] via-[#17224D] to-[#363942]">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Logging out...</h2>
        {reason && (
          <p className="text-white/80 text-sm">
            {reason === "session_invalid" && "Your session has expired"}
            {reason === "no_token" && "Session token not found"}
            {reason === "revoked" && "Your session was revoked"}
          </p>
        )}
      </div>
    </div>
  );
}
