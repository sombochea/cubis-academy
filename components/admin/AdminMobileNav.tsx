'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LayoutDashboard, BookOpen, Users, GraduationCap, DollarSign, UserCheck } from 'lucide-react';
import { Trans } from '@lingui/react/macro';
import { Button } from '@/components/ui/button';

export function AdminMobileNav({ locale }: { locale: string }) {
  const [isOpen, setIsOpen] = useState(false);
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
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed top-16 right-0 bottom-0 w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#007FFF]/10 text-[#007FFF]'
                    : 'text-[#363942] hover:bg-[#F4F5F7]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <Trans>{item.label}</Trans>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
