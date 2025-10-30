'use client';

import { Trans } from '@lingui/react/macro';
import { Calendar, Clock, MapPin, Monitor, AlertCircle } from 'lucide-react';

type Schedule = {
  id: string;
  courseId: string;
  courseTitle: string;
  dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  startTime: string;
  endTime: string;
  location: string | null;
  notes: string | null;
};

interface UpcomingClassesProps {
  schedules: Schedule[];
  locale: string;
}

export function UpcomingClasses({ schedules, locale }: UpcomingClassesProps) {
  const today = new Date();
  const currentDay = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ][today.getDay()];

  // Sort schedules by day (starting from today)
  const dayOrder = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];
  const currentDayIndex = dayOrder.indexOf(currentDay);

  const sortedSchedules = [...schedules].sort((a, b) => {
    const aIndex = dayOrder.indexOf(a.dayOfWeek);
    const bIndex = dayOrder.indexOf(b.dayOfWeek);

    // Calculate days from today
    const aDaysFromToday = (aIndex - currentDayIndex + 7) % 7;
    const bDaysFromToday = (bIndex - currentDayIndex + 7) % 7;

    if (aDaysFromToday !== bDaysFromToday) {
      return aDaysFromToday - bDaysFromToday;
    }

    // If same day, sort by start time
    return a.startTime.localeCompare(b.startTime);
  });

  // Get next 5 upcoming classes
  const upcomingClasses = sortedSchedules.slice(0, 5);

  const getDayColor = (day: string) => {
    return day === currentDay ? 'from-blue-500 to-cyan-500' : 'from-gray-500 to-gray-600';
  };

  const isOnline = (location: string | null) => {
    if (!location) return false;
    return (
      location.toLowerCase().includes('zoom') ||
      location.toLowerCase().includes('meet') ||
      location.toLowerCase().includes('http')
    );
  };

  if (upcomingClasses.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-[#17224D] mb-6 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          <Trans>Upcoming Classes</Trans>
        </h3>
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-[#363942]/20 mx-auto mb-3" />
          <p className="text-sm text-[#363942]/70">
            <Trans>No upcoming classes scheduled</Trans>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-[#17224D] mb-6 flex items-center gap-2">
        <Calendar className="w-5 h-5" />
        <Trans>Upcoming Classes</Trans>
      </h3>

      <div className="space-y-4">
        {upcomingClasses.map((schedule) => {
          const isToday = schedule.dayOfWeek === currentDay;
          const online = isOnline(schedule.location);

          return (
            <div
              key={schedule.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                isToday
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-[#F4F5F7] border-transparent hover:border-gray-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 bg-gradient-to-br ${getDayColor(
                    schedule.dayOfWeek
                  )} rounded-lg flex items-center justify-center flex-shrink-0 shadow-md`}
                >
                  <Calendar className="w-5 h-5 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-semibold text-[#17224D] text-sm">
                      {schedule.courseTitle}
                    </h4>
                    {isToday && (
                      <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                        <Trans>Today</Trans>
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-[#363942]/70">
                      <span className="font-medium capitalize">{schedule.dayOfWeek}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#363942]/70">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {schedule.startTime} - {schedule.endTime}
                      </span>
                    </div>

                    {schedule.location && (
                      <div className="flex items-center gap-2 text-xs text-[#363942]/70">
                        {online ? (
                          <Monitor className="w-3.5 h-3.5" />
                        ) : (
                          <MapPin className="w-3.5 h-3.5" />
                        )}
                        <span className="truncate">{schedule.location}</span>
                      </div>
                    )}

                    {schedule.notes && (
                      <p className="text-xs text-[#363942]/70 italic mt-2">{schedule.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-[#363942]/70 text-center">
          <Trans>Showing next {upcomingClasses.length} classes</Trans>
        </p>
      </div>
    </div>
  );
}
