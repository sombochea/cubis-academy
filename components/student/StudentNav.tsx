import Link from 'next/link';
import { BookOpen, Menu } from 'lucide-react';
import { Trans } from '@lingui/react/macro';
import { StudentNavClient } from './StudentNavClient';
import { StudentMobileNav } from './StudentMobileNav';
import { UserNav } from '@/components/UserNav';
import { auth } from '@/auth';

export async function StudentNav({ locale }: { locale: string }) {
  const session = await auth();
  
  // Prepare user data for client component
  const initialUser = session?.user ? {
    id: session.user.id!,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
    role: session.user.role,
    suid: (session.user as any).suid,
  } : null;
  
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href={`/${locale}/student`} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#007FFF] to-[#17224D] rounded-lg flex items-center justify-center shadow-md">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-bold text-[#17224D] hidden sm:block">
                <Trans>CUBIS Academy</Trans>
              </h1>
            </Link>
            
            <StudentNavClient locale={locale} />
          </div>
          
          <div className="flex items-center gap-4">
            <UserNav locale={locale} initialUser={initialUser} />
            <StudentMobileNav locale={locale} />
          </div>
        </div>
      </div>
    </nav>
  );
}
