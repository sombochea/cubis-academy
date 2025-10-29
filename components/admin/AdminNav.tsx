import Link from 'next/link';
import { BookOpen, Users, GraduationCap, DollarSign, UserCheck, LayoutDashboard } from 'lucide-react';
import { Trans } from '@lingui/react/macro';
import { AdminNavClient } from './AdminNavClient';

export function AdminNav({ locale }: { locale: string }) {
  
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href={`/${locale}/admin`} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#007FFF] to-[#17224D] rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-bold text-[#17224D] hidden sm:block">
                <Trans>CUBIS Academy</Trans>
              </h1>
            </Link>
            
            <AdminNavClient locale={locale} />
          </div>
          
          <form action={async () => {
            'use server';
            const { signOut } = await import('@/auth');
            await signOut({ redirectTo: `/${locale}` });
          }}>
            <button className="text-sm text-red-600 hover:text-red-700 font-semibold">
              <Trans>Logout</Trans>
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}
