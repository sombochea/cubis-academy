'use client';

import { Trans } from '@lingui/react/macro';
import { Activity, Award, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';

type ActivityItem = {
  type: string;
  title: string;
  courseTitle: string;
  value: string;
  date: Date;
};

interface RecentActivityProps {
  activities: ActivityItem[];
  locale: string;
}

export function RecentActivity({ activities, locale }: RecentActivityProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'score':
        return Award;
      case 'attendance':
        return CheckCircle;
      case 'payment':
        return DollarSign;
      default:
        return Activity;
    }
  };

  const getActivityColor = (type: string, value: string) => {
    if (type === 'attendance') {
      return value === 'present'
        ? 'from-green-500 to-emerald-500'
        : value === 'absent'
        ? 'from-red-500 to-pink-500'
        : 'from-yellow-500 to-orange-500';
    }
    if (type === 'score') {
      return 'from-blue-500 to-cyan-500';
    }
    if (type === 'payment') {
      return 'from-purple-500 to-pink-500';
    }
    return 'from-gray-500 to-gray-600';
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return new Date(date).toLocaleDateString();
    }
  };

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-[#17224D] mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          <Trans>Recent Activity</Trans>
        </h3>
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-[#363942]/20 mx-auto mb-3" />
          <p className="text-[#363942]/70">
            <Trans>No recent activity</Trans>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-[#17224D] mb-6 flex items-center gap-2">
        <Activity className="w-5 h-5" />
        <Trans>Recent Activity</Trans>
      </h3>

      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = getActivityIcon(activity.type);
          const colorClass = getActivityColor(activity.type, activity.value);

          return (
            <div
              key={index}
              className="flex items-start gap-4 p-4 bg-[#F4F5F7] rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div
                className={`w-10 h-10 bg-gradient-to-br ${colorClass} rounded-lg flex items-center justify-center flex-shrink-0 shadow-md`}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-semibold text-[#17224D] mb-1">
                      {activity.type === 'score' && <Trans>New Score</Trans>}
                      {activity.type === 'attendance' && <Trans>Attendance Marked</Trans>}
                      {activity.type === 'payment' && <Trans>Payment Completed</Trans>}
                    </p>
                    <p className="text-sm text-[#363942]/70 mb-1">{activity.courseTitle}</p>
                    {activity.type === 'score' && (
                      <p className="text-sm text-[#363942]">
                        <span className="font-medium">{activity.title}:</span> {activity.value}
                      </p>
                    )}
                    {activity.type === 'attendance' && (
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                          activity.value === 'present'
                            ? 'bg-green-100 text-green-700'
                            : activity.value === 'absent'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        <Trans>{activity.value}</Trans>
                      </span>
                    )}
                    {activity.type === 'payment' && (
                      <p className="text-sm font-semibold text-[#007FFF]">{activity.value}</p>
                    )}
                  </div>
                  <span className="text-xs text-[#363942]/70 whitespace-nowrap">
                    {formatDate(activity.date)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
