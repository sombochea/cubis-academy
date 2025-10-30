import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { Trans } from '@lingui/react/macro';
import { UserNav } from '@/components/UserNav';
import { auth } from '@/auth';

export async function TeacherNav({ locale }: { locale: string }) {
  const session = await auth();
  
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href={`/${locale}/teacher`} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#007FFF] to-[#17224D] rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-bold text-[#17224D] hidden sm:block">
                <Trans>CUBIS Academy</Trans>
              </h1>
            </Link>
            
            <div className="hidden md:flex items-center gap-6">
              <Link 
                href={`/${locale}/teacher`}
                className="text-sm font-medium text-[#363942] hover:text-[#007FFF] transition-colors"
              >
                <Trans>Dashboard</Trans>
              </Link>
              <Link 
                href={`/${locale}/teacher/courses`}
                className="text-sm font-medium text-[#363942] hover:text-[#007FFF] transition-colors"
              >
                <Trans>My Courses</Trans>
              </Link>
              <Link 
                href={`/${locale}/teacher/students`}
                className="text-sm font-medium text-[#363942] hover:text-[#007FFF] transition-colors"
              >
                <Trans>Students</Trans>
              </Link>
            </div>
          </div>
          
          <UserNav locale={locale} />
        </div>
      </div>
    </nav>
  );
}
