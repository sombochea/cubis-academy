import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';
import { Trans } from '@lingui/react/macro';
import { setI18n } from '@lingui/react/server';
import { loadCatalog, i18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { LogOut, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function LogoutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await loadCatalog(locale);
  setI18n(i18n);
  
  const session = await auth();
  
  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#007FFF] to-[#17224D] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogOut className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-[#17224D] mb-2">
            <Trans>Sign Out</Trans>
          </h1>
          <p className="text-[#363942]/70">
            <Trans>Are you sure you want to sign out?</Trans>
          </p>
        </div>

        <div className="space-y-4">
          <form
            action={async () => {
              'use server';
              await signOut({ redirectTo: `/${locale}/login` });
            }}
          >
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-6 text-lg"
            >
              <LogOut className="mr-2 h-5 w-5" />
              <Trans>Yes, Sign Out</Trans>
            </Button>
          </form>

          <Link href={`/${locale}/${session.user.role === 'admin' ? 'admin' : session.user.role === 'teacher' ? 'teacher' : 'student'}`}>
            <Button
              variant="outline"
              className="w-full py-6 text-lg font-semibold"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              <Trans>Cancel</Trans>
            </Button>
          </Link>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-800">
            <Trans>You will be redirected to the login page after signing out.</Trans>
          </p>
        </div>
      </div>
    </div>
  );
}
