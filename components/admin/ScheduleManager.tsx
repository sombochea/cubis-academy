'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trans } from '@lingui/react/macro';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Calendar, Clock, Plus, Edit, Trash2, MapPin, Monitor, Loader2, AlertCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

type Schedule = {
  id: string;
  dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  startTime: string;
  endTime: string;
  location: string | null;
  notes: string | null;
  isActive: boolean;
};

interface ScheduleManagerProps {
  courseId: string;
  initialSchedules: Schedule[];
  deliveryMode: 'online' | 'face_to_face' | 'hybrid';
  defaultLocation: string | null;
  locale: string;
}

export function ScheduleManager({
  courseId,
  initialSchedules,
  deliveryMode,
  defaultLocation,
  locale,
}: ScheduleManagerProps) {
  const router = useRouter();
  const [schedules, setSchedules] = useState<Schedule[]>(initialSchedules);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [deleteScheduleId, setDeleteScheduleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    dayOfWeek: 'monday' as const,
    startTime: '09:00',
    endTime: '11:00',
    location: defaultLocation || '',
    notes: '',
    isActive: true,
  });

  const dayLabels = {
    monday: <Trans>Monday</Trans>,
    tuesday: <Trans>Tuesday</Trans>,
    wednesday: <Trans>Wednesday</Trans>,
    thursday: <Trans>Thursday</Trans>,
    friday: <Trans>Friday</Trans>,
    saturday: <Trans>Saturday</Trans>,
    sunday: <Trans>Sunday</Trans>,
  };

  const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  const sortedSchedules = [...schedules].sort((a, b) => {
    return dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek);
  });

  const handleOpenDialog = (schedule?: Schedule) => {
    if (schedule) {
      setEditingSchedule(schedule);
      setFormData({
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        location: schedule.location || '',
        notes: schedule.notes || '',
        isActive: schedule.isActive,
      });
    } else {
      setEditingSchedule(null);
      setFormData({
        dayOfWeek: 'monday',
        startTime: '09:00',
        endTime: '11:00',
        location: defaultLocation || '',
        notes: '',
        isActive: true,
      });
    }
    setIsDialogOpen(true);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (formData.startTime >= formData.endTime) {
        setError('End time must be after start time');
        setLoading(false);
        return;
      }

      if (editingSchedule) {
        // Update existing schedule
        const response = await fetch(`/api/schedules/${editingSchedule.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to update schedule');
        }

        const updated = await response.json();
        setSchedules(schedules.map((s) => (s.id === updated.id ? updated : s)));
      } else {
        // Create new schedule
        const response = await fetch(`/api/courses/${courseId}/schedules`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to create schedule');
        }

        const newSchedule = await response.json();
        setSchedules([...schedules, newSchedule]);
      }

      setIsDialogOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteScheduleId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/schedules/${deleteScheduleId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete schedule');
      }

      setSchedules(schedules.filter((s) => s.id !== deleteScheduleId));
      setDeleteScheduleId(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Add Schedule Button */}
      <div className="mb-6">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              <Trans>Add Schedule</Trans>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingSchedule ? <Trans>Edit Schedule</Trans> : <Trans>Add Schedule</Trans>}
              </DialogTitle>
              <DialogDescription>
                <Trans>Set the day, time, and location for this class session</Trans>
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Day of Week */}
              <div>
                <Label htmlFor="dayOfWeek">
                  <Trans>Day of Week</Trans> *
                </Label>
                <Select
                  value={formData.dayOfWeek}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, dayOfWeek: value })
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dayOrder.map((day) => (
                      <SelectItem key={day} value={day}>
                        {dayLabels[day as keyof typeof dayLabels]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Time Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">
                    <Trans>Start Time</Trans> *
                  </Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                    className="mt-2"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">
                    <Trans>End Time</Trans> *
                  </Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                    className="mt-2"
                    required
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <Label htmlFor="location">
                  <Trans>Location</Trans>
                </Label>
                <Input
                  id="location"
                  type="text"
                  placeholder={
                    deliveryMode === 'online'
                      ? 'Zoom link or meeting URL'
                      : 'Room number or building name'
                  }
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="mt-2"
                />
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">
                  <Trans>Notes</Trans>
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Additional information about this class..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="mt-2"
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label htmlFor="isActive" className="font-semibold">
                    <Trans>Active</Trans>
                  </Label>
                  <p className="text-sm text-[#363942]/70">
                    <Trans>Show this schedule to students</Trans>
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={loading}
                >
                  <Trans>Cancel</Trans>
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <Trans>Saving...</Trans>
                    </>
                  ) : editingSchedule ? (
                    <Trans>Update Schedule</Trans>
                  ) : (
                    <Trans>Add Schedule</Trans>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Schedules List */}
      {sortedSchedules.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Calendar className="w-16 h-16 text-[#363942]/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#17224D] mb-2">
            <Trans>No schedules yet</Trans>
          </h3>
          <p className="text-[#363942]/70 mb-6">
            <Trans>Add your first class schedule to get started</Trans>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedSchedules.map((schedule) => (
            <div
              key={schedule.id}
              className={`bg-white rounded-xl border-2 p-5 transition-all ${
                schedule.isActive
                  ? 'border-gray-100 hover:border-[#007FFF]/30 hover:shadow-lg'
                  : 'border-gray-200 bg-gray-50 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#007FFF] to-[#17224D] rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#17224D]">
                      {dayLabels[schedule.dayOfWeek]}
                    </h4>
                    {!schedule.isActive && (
                      <span className="text-xs text-[#363942]/70">
                        <Trans>Inactive</Trans>
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDialog(schedule)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteScheduleId(schedule.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-[#363942]">
                  <Clock className="w-4 h-4" />
                  <span>
                    {schedule.startTime} - {schedule.endTime}
                  </span>
                </div>

                {schedule.location && (
                  <div className="flex items-start gap-2 text-[#363942]">
                    {deliveryMode === 'online' ? (
                      <Monitor className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    ) : (
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    )}
                    <span className="break-all">{schedule.location}</span>
                  </div>
                )}

                {schedule.notes && (
                  <p className="text-[#363942]/70 pt-2 border-t border-gray-100">
                    {schedule.notes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteScheduleId}
        onOpenChange={() => setDeleteScheduleId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <Trans>Delete Schedule</Trans>
            </AlertDialogTitle>
            <AlertDialogDescription>
              <Trans>
                Are you sure you want to delete this schedule? This action cannot be undone.
              </Trans>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>
              <Trans>Cancel</Trans>
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <Trans>Deleting...</Trans>
                </>
              ) : (
                <Trans>Delete</Trans>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
