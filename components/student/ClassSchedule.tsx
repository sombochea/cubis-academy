'use client';

import { Trans } from '@lingui/react/macro';
import { Calendar, Clock, MapPin, Monitor, Video } from 'lucide-react';

type Schedule = {
  id: string;
  dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  startTime: string;
  endTime: string;
  location: string | null;
  notes: string | null;
};

interface ClassScheduleProps {
  schedules: Schedule[];
  deliveryMode: 'online' | 'face_to_face' | 'hybrid';
}

export function ClassSchedule({ schedules, deliveryMode }: ClassScheduleProps) {
  const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  const dayLabels = {
    monday: <Trans>Monday</Trans>,
    tuesday: <Trans>Tuesday</Trans>,
    wednesday: <Trans>Wednesday</Trans>,
    thursday: <Trans>Thursday</Trans>,
    friday: <Trans>Friday</Trans>,
    saturday: <Trans>Saturday</Trans>,
    sunday: <Trans>Sunday</Trans>,
  };

  // Sort schedules by day of week
  const sortedSchedules = [...schedules].sort((a, b) => {
    return dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek);
  });

  if (schedules.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="w-12 h-12 text-[#363942]/20 mx-auto mb-3" />
        <p className="text-[#363942]/70">
          <Trans>No class schedule available</Trans>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sortedSchedules.map((schedule) => (
        <div
          key={schedule.id}
          className="p-4 bg-[#F4F5F7] rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#007FFF] to-[#17224D] rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-[#17224D]">
                  {dayLabels[schedule.dayOfWeek]}
                </h4>
                <div className="flex items-center gap-2 text-sm text-[#363942]/70">
                  <Clock className="w-4 h-4" />
                  <span>
                    {schedule.startTime} - {schedule.endTime}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {schedule.location && (
            <div className="flex items-start gap-2 text-sm text-[#363942] mb-2">
              {deliveryMode === 'online' ? (
                <Monitor className="w-4 h-4 mt-0.5 flex-shrink-0" />
              ) : (
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              )}
              <span className="break-all">{schedule.location}</span>
            </div>
          )}

          {schedule.notes && (
            <div className="text-sm text-[#363942]/70 mt-2 pl-6">
              {schedule.notes}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
