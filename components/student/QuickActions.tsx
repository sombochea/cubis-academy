'use client';

import Link from 'next/link';
import { Trans } from '@lingui/react/macro';
import {
  BookOpen,
  DollarSign,
  User,
  GraduationCap,
  Search,
  FileText,
  Zap,
} from 'lucide-react';

interface QuickActionsProps {
  locale: string;
}

export function QuickActions({ locale }: QuickActionsProps) {
  const actions = [
    {
      title: <Trans>Browse Courses</Trans>,
      description: <Trans>Explore new courses</Trans>,
      icon: Search,
      href: `/${locale}/student/courses`,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: <Trans>My Courses</Trans>,
      description: <Trans>View enrollments</Trans>,
      icon: GraduationCap,
      href: `/${locale}/student/enrollments`,
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: <Trans>Make Payment</Trans>,
      description: <Trans>Submit payment</Trans>,
      icon: DollarSign,
      href: `/${locale}/student/payments/new`,
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: <Trans>View Payments</Trans>,
      description: <Trans>Payment history</Trans>,
      icon: FileText,
      href: `/${locale}/student/payments`,
      color: 'from-orange-500 to-red-500',
    },
    {
      title: <Trans>My Profile</Trans>,
      description: <Trans>Update information</Trans>,
      icon: User,
      href: `/${locale}/student/profile`,
      color: 'from-indigo-500 to-purple-500',
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-[#17224D] mb-6 flex items-center gap-2">
        <Zap className="w-5 h-5" />
        <Trans>Quick Actions</Trans>
      </h3>

      <div className="space-y-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Link
              key={index}
              href={action.href}
              className="flex items-center gap-3 p-3 bg-[#F4F5F7] rounded-lg hover:bg-gray-100 transition-all hover:scale-[1.02] group"
            >
              <div
                className={`w-10 h-10 bg-gradient-to-br ${action.color} rounded-lg flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform`}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#17224D]">{action.title}</p>
                <p className="text-xs text-[#363942]/70">{action.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
