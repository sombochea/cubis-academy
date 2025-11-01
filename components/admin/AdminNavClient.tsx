'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Users, GraduationCap, DollarSign, UserCheck, LayoutDashboard } from 'lucide-react';
import { Trans } from '@lingui/react/macro';

export function AdminNavClient({ locale }: { locale: string }) {
  const pathname = usePathname();
  
  const navItems = [
    { href: `/${locale}/admin`, label: 'Dashboard', icon: LayoutDashboard },
    { href: `/${locale}/admin/teachers`, label: 'Teachers', icon: GraduationCap },
    { href: `/${locale}/admin/courses`, label: 'Courses', icon: BookOpen },
    { href: `/${locale}/admin/students`, label: 'Students', icon: Users },
    { href: `/${locale}/admin/enrollments`, label: 'Enrollments', icon: UserCheck },
    { href: `/${locale}/admin/payments`, label: 'Payments', icon: DollarSign },
  ];

  return (
    <div className="hidden xl:flex items-center gap-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-[#007FFF]/10 text-[#007FFF]'
                : 'text-[#363942] hover:bg-[#F4F5F7]'
            }`}
          >
            <Icon className="w-4 h-4" />
            <Trans>{item.label}</Trans>
          </Link>
        );
      })}
    </div>
  );
}
