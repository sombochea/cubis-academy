'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, LayoutDashboard, Users, GraduationCap } from 'lucide-react';
import { Trans } from '@lingui/react/macro';
import { UserNav } from '@/components/UserNav';
import { TeacherMobileNav } from './TeacherMobileNav';
import { cn } from '@/lib/utils';

export function TeacherNav({ locale }: { locale: string }) {
  const pathname = usePathname();

  const navItems = [
    {
      href: `/${locale}/teacher`,
      label: <Trans>Dashboard</Trans>,
      icon: LayoutDashboard,
      exact: true,
    },
    {
      href: `/${locale}/teacher/courses`,
      label: <Trans>My Courses</Trans>,
      icon: BookOpen,
    },
    {
      href: `/${locale}/teacher/students`,
      label: <Trans>Students</Trans>,
      icon: Users,
    },
  ];

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/${locale}/teacher`} className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#007FFF] to-[#17224D] rounded-lg flex items-center justify-center shadow-lg">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-[#17224D]">
                <Trans>CUBIS Academy</Trans>
              </h1>
              <p className="text-xs text-[#363942]/60">
                <Trans>Teacher Portal</Trans>
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                    active
                      ? 'bg-[#007FFF] text-white shadow-md'
                      : 'text-[#363942] hover:bg-gray-100'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* User Menu */}
            <UserNav locale={locale} />

            {/* Mobile Navigation */}
            <TeacherMobileNav locale={locale} />
          </div>
        </div>
      </div>
    </nav>
  );
}
