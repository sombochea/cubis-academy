'use client';

import Link from 'next/link';
import { Trans } from '@lingui/react/macro';
import {
  BookOpen,
  Clock,
  Award,
  DollarSign,
  TrendingUp,
  Target,
  CheckCircle,
} from 'lucide-react';

interface DashboardStatsProps {
  totalCourses: number;
  activeCourses: number;
  completedCourses: number;
  avgProgress: number;
  totalSpent: number;
  avgScore: number;
  attendanceRate: number;
  locale: string;
}

export function DashboardStats({
  totalCourses,
  activeCourses,
  completedCourses,
  avgProgress,
  totalSpent,
  avgScore,
  attendanceRate,
  locale,
}: DashboardStatsProps) {
  const stats = [
    {
      title: <Trans>Total Courses</Trans>,
      value: totalCourses,
      icon: BookOpen,
      color: 'from-blue-500 to-cyan-500',
      href: `/${locale}/student/enrollments`,
      change: null,
    },
    {
      title: <Trans>Active Courses</Trans>,
      value: activeCourses,
      icon: Clock,
      color: 'from-purple-500 to-pink-500',
      href: `/${locale}/student/enrollments`,
      change: null,
    },
    {
      title: <Trans>Completed</Trans>,
      value: completedCourses,
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-500',
      href: `/${locale}/student/enrollments`,
      change: null,
    },
    {
      title: <Trans>Avg Progress</Trans>,
      value: `${avgProgress}%`,
      icon: TrendingUp,
      color: 'from-indigo-500 to-purple-500',
      href: `/${locale}/student/enrollments`,
      change: null,
    },
    {
      title: <Trans>Avg Score</Trans>,
      value: `${avgScore}%`,
      icon: Target,
      color: 'from-orange-500 to-red-500',
      href: `/${locale}/student/enrollments`,
      change: avgScore >= 70 ? '+' : null,
    },
    {
      title: <Trans>Attendance</Trans>,
      value: `${attendanceRate}%`,
      icon: Award,
      color: 'from-teal-500 to-green-500',
      href: `/${locale}/student/enrollments`,
      change: attendanceRate >= 80 ? '+' : null,
    },
    {
      title: <Trans>Total Spent</Trans>,
      value: `$${totalSpent.toFixed(2)}`,
      icon: DollarSign,
      color: 'from-yellow-500 to-orange-500',
      href: `/${locale}/student/payments`,
      change: null,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Link
            key={index}
            href={stat.href}
            className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>
              {stat.change && (
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  {stat.change}
                </span>
              )}
            </div>
            <p className="text-sm text-[#363942]/70 mb-1">{stat.title}</p>
            <p className="text-2xl font-bold text-[#17224D]">{stat.value}</p>
          </Link>
        );
      })}
    </div>
  );
}
