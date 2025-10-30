'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Trans } from '@lingui/react/macro';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Home, LogOut } from 'lucide-react';

export default function UnauthorizedPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'km';

  const handleLogout = async () => {
    await signOut({ callbackUrl: `/${locale}/login` });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <ShieldAlert className="w-10 h-10 text-red-600" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            <Trans>403 - Unauthorized</Trans>
          </h1>

          {/* Description */}
          <p className="text-gray-600 mb-8">
            <Trans>You don't have permission to access this page. Please contact your administrator if you believe this is an error.</Trans>
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="outline" className="gap-2">
              <Link href={`/${locale}`}>
                <Home className="w-4 h-4" />
                <Trans>Go Home</Trans>
              </Link>
            </Button>
            
            <Button onClick={handleLogout} variant="destructive" className="gap-2">
              <LogOut className="w-4 h-4" />
              <Trans>Logout</Trans>
            </Button>
          </div>

          {/* Help Text */}
          <p className="text-sm text-gray-500 mt-6">
            <Trans>If you just logged in, try refreshing the page.</Trans>
          </p>
        </div>
      </div>
    </div>
  );
}
