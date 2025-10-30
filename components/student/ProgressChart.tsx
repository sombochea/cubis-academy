'use client';

import { Trans } from '@lingui/react/macro';
import { TrendingUp, BookOpen } from 'lucide-react';

type Enrollment = {
  id: string;
  courseTitle: string;
  courseCategory: string | null;
  courseLevel: 'beginner' | 'intermediate' | 'advanced';
  status: 'active' | 'completed' | 'dropped';
  progress: number;
};

interface ProgressChartProps {
  enrollments: Enrollment[];
}

export function ProgressChart({ enrollments }: ProgressChartProps) {
  const activeEnrollments = enrollments.filter((e) => e.status === 'active');

  if (activeEnrollments.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-[#17224D] mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          <Trans>Course Progress</Trans>
        </h3>
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-[#363942]/20 mx-auto mb-3" />
          <p className="text-[#363942]/70">
            <Trans>No active courses to track</Trans>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-[#17224D] mb-6 flex items-center gap-2">
        <TrendingUp className="w-5 h-5" />
        <Trans>Course Progress</Trans>
      </h3>

      <div className="space-y-6">
        {activeEnrollments.map((enrollment) => {
          const progressColor =
            enrollment.progress >= 75
              ? 'bg-green-500'
              : enrollment.progress >= 50
              ? 'bg-blue-500'
              : enrollment.progress >= 25
              ? 'bg-yellow-500'
              : 'bg-red-500';

          const levelColor =
            enrollment.courseLevel === 'beginner'
              ? 'bg-green-100 text-green-700'
              : enrollment.courseLevel === 'intermediate'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-red-100 text-red-700';

          return (
            <div key={enrollment.id} className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-[#17224D] mb-1">
                    {enrollment.courseTitle}
                  </h4>
                  <div className="flex items-center gap-2">
                    {enrollment.courseCategory && (
                      <span className="text-xs text-[#363942]/70">
                        {enrollment.courseCategory}
                      </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${levelColor}`}>
                      <Trans>{enrollment.courseLevel}</Trans>
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#17224D]">{enrollment.progress}%</p>
                  <p className="text-xs text-[#363942]/70">
                    <Trans>Complete</Trans>
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative">
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full ${progressColor} transition-all duration-500 relative overflow-hidden`}
                    style={{ width: `${enrollment.progress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Overall Progress Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[#363942]/70">
              <Trans>Overall Progress</Trans>
            </p>
            <p className="text-lg font-bold text-[#17224D]">
              {Math.round(
                activeEnrollments.reduce((sum, e) => sum + e.progress, 0) /
                  activeEnrollments.length
              )}
              %
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-[#363942]/70">
              <Trans>Active Courses</Trans>
            </p>
            <p className="text-lg font-bold text-[#17224D]">{activeEnrollments.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
