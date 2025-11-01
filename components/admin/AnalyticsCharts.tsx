'use client';

/**
 * Analytics Charts Component
 * 
 * Displays various charts for analytics visualization
 */

import { Trans } from '@lingui/react/macro';
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
} from 'lucide-react';

interface ChartData {
  enrollmentTrends: Array<{ month: string; count: number }>;
  revenueTrends: Array<{ month: string; amount: number }>;
  categoryDistribution: Array<{ category: string; count: number }>;
  performanceMetrics: {
    avgProgress: number;
    avgScore: number;
    completionRate: number;
    attendanceRate: number;
  };
}

interface AnalyticsChartsProps {
  data: ChartData;
}

export function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  return (
    <div className="space-y-6">
      {/* Enrollment Trends */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#17224D]">
              <Trans>Enrollment Trends</Trans>
            </h3>
            <p className="text-sm text-[#363942]/70">
              <Trans>Monthly enrollment statistics</Trans>
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {data.enrollmentTrends.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-20 text-sm text-[#363942]/70">{item.month}</div>
              <div className="flex-1">
                <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg transition-all duration-500"
                    style={{
                      width: `${Math.min((item.count / Math.max(...data.enrollmentTrends.map(d => d.count))) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
              <div className="w-16 text-right text-sm font-semibold text-[#17224D]">
                {item.count}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Trends */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#17224D]">
              <Trans>Revenue Trends</Trans>
            </h3>
            <p className="text-sm text-[#363942]/70">
              <Trans>Monthly revenue statistics</Trans>
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {data.revenueTrends.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-20 text-sm text-[#363942]/70">{item.month}</div>
              <div className="flex-1">
                <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg transition-all duration-500"
                    style={{
                      width: `${Math.min((item.amount / Math.max(...data.revenueTrends.map(d => d.amount))) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
              <div className="w-24 text-right text-sm font-semibold text-[#17224D]">
                ${item.amount.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Distribution */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#17224D]">
              <Trans>Category Distribution</Trans>
            </h3>
            <p className="text-sm text-[#363942]/70">
              <Trans>Enrollments by category</Trans>
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {data.categoryDistribution.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-32 text-sm text-[#363942]/70 capitalize">
                {item.category}
              </div>
              <div className="flex-1">
                <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg transition-all duration-500"
                    style={{
                      width: `${Math.min((item.count / Math.max(...data.categoryDistribution.map(d => d.count))) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
              <div className="w-16 text-right text-sm font-semibold text-[#17224D]">
                {item.count}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#17224D]">
              <Trans>Performance Metrics</Trans>
            </h3>
            <p className="text-sm text-[#363942]/70">
              <Trans>Overall platform performance</Trans>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm text-[#363942]/70">
              <Trans>Average Progress</Trans>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                  style={{ width: `${data.performanceMetrics.avgProgress}%` }}
                />
              </div>
              <div className="text-sm font-semibold text-[#17224D]">
                {data.performanceMetrics.avgProgress}%
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-[#363942]/70">
              <Trans>Average Score</Trans>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                  style={{ width: `${data.performanceMetrics.avgScore}%` }}
                />
              </div>
              <div className="text-sm font-semibold text-[#17224D]">
                {data.performanceMetrics.avgScore}%
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-[#363942]/70">
              <Trans>Completion Rate</Trans>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  style={{ width: `${data.performanceMetrics.completionRate}%` }}
                />
              </div>
              <div className="text-sm font-semibold text-[#17224D]">
                {data.performanceMetrics.completionRate}%
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-[#363942]/70">
              <Trans>Attendance Rate</Trans>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                  style={{ width: `${data.performanceMetrics.attendanceRate}%` }}
                />
              </div>
              <div className="text-sm font-semibold text-[#17224D]">
                {data.performanceMetrics.attendanceRate}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
