'use client';

import { useState } from 'react';
import { Trans } from '@lingui/react/macro';
import {
  Plus,
  CalendarCheck,
  Users,
  TrendingUp,
  BarChart3,
  Loader2,
  CheckCircle,
  AlertCircle,
  Check,
  X,
  Clock,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { formatDate } from '@/lib/utils/date';

interface AttendanceRecord {
  id: string;
  enrollmentId: string;
  date: Date;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes: string | null;
}

interface Student {
  enrollmentId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  status: string;
  attendanceRecords: AttendanceRecord[];
  presentCount: number;
  totalRecords: number;
  attendanceRate: number | null;
}

interface AttendanceManagerProps {
  students: Student[];
  courseId: string;
  locale: string;
}

export function AttendanceManager({ students, locale }: AttendanceManagerProps) {
  const [isMarkDialogOpen, setIsMarkDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [notes, setNotes] = useState('');
  const [studentStatuses, setStudentStatuses] = useState<
    Record<string, 'present' | 'absent' | 'late' | 'excused'>
  >({});

  // Calculate stats
  const totalStudents = students.length;
  const avgAttendanceRate = students.length > 0
    ? Math.round(
        students
          .filter((s) => s.attendanceRate !== null)
          .reduce((sum, s) => sum + (s.attendanceRate || 0), 0) /
          students.filter((s) => s.attendanceRate !== null).length
      ) || 0
    : 0;
  const totalSessions = students.length > 0
    ? Math.max(...students.map((s) => s.totalRecords))
    : 0;
  const studentsWithRecords = students.filter((s) => s.totalRecords > 0).length;

  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!selectedDate) {
        setError('Please select a date');
        setIsLoading(false);
        return;
      }

      const attendanceData = students.map((student) => ({
        enrollmentId: student.enrollmentId,
        date: selectedDate.toISOString().split('T')[0],
        status: studentStatuses[student.enrollmentId] || 'present',
        notes: notes || null,
      }));

      const response = await fetch('/api/teacher/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendanceData }),
      });

      if (!response.ok) throw new Error('Failed to mark attendance');

      setSuccess('Attendance marked successfully!');
      setStudentStatuses({});
      setNotes('');
      setTimeout(() => {
        setIsMarkDialogOpen(false);
        window.location.reload();
      }, 1500);
    } catch (error) {
      setError('Failed to mark attendance. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStudentStatus = (enrollmentId: string) => {
    const currentStatus = studentStatuses[enrollmentId] || 'present';
    const statusOrder: Array<'present' | 'absent' | 'late' | 'excused'> = [
      'present',
      'late',
      'absent',
      'excused',
    ];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    setStudentStatuses({ ...studentStatuses, [enrollmentId]: nextStatus });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <Check className="w-4 h-4" />;
      case 'absent':
        return <X className="w-4 h-4" />;
      case 'late':
        return <Clock className="w-4 h-4" />;
      case 'excused':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Check className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'absent':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'late':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'excused':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#17224D]">{totalStudents}</div>
              <div className="text-sm text-[#363942]/70">
                <Trans>Total Students</Trans>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#17224D]">{avgAttendanceRate}%</div>
              <div className="text-sm text-[#363942]/70">
                <Trans>Avg Attendance</Trans>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <CalendarCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#17224D]">{totalSessions}</div>
              <div className="text-sm text-[#363942]/70">
                <Trans>Total Sessions</Trans>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#17224D]">{studentsWithRecords}</div>
              <div className="text-sm text-[#363942]/70">
                <Trans>With Records</Trans>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mark Attendance Button */}
      <div className="flex justify-end">
        <Dialog open={isMarkDialogOpen} onOpenChange={setIsMarkDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              <Trans>Mark Attendance</Trans>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                <Trans>Mark Attendance</Trans>
              </DialogTitle>
              <DialogDescription>
                <Trans>Mark attendance for all students in this session</Trans>
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleMarkAttendance} className="space-y-4">
              {success && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>{success}</span>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="session-date" className="flex items-center gap-2 text-sm font-medium text-[#17224D]">
                  <CalendarIcon className="w-4 h-4 text-[#007FFF]" />
                  <Trans>Session Date</Trans>
                  <span className="text-red-500">*</span>
                </Label>
                <DatePicker
                  date={selectedDate}
                  onSelect={setSelectedDate}
                  placeholder="Select session date"
                  fromYear={2020}
                  toYear={new Date().getFullYear() + 1}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium text-[#17224D]">
                  <Users className="w-4 h-4 text-[#007FFF]" />
                  <Trans>Students</Trans>
                  <span className="text-xs text-[#363942]/70 font-normal ml-1">
                    (<Trans>Click to change status</Trans>)
                  </span>
                </Label>
                <div className="space-y-2">
                  {students.map((student) => {
                    const status = studentStatuses[student.enrollmentId] || 'present';
                    return (
                      <div
                        key={student.enrollmentId}
                        className="flex items-center justify-between p-3 bg-[#F4F5F7] rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-[#007FFF] to-[#17224D] rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {student.studentName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-[#17224D]">
                              {student.studentName}
                            </div>
                            <div className="text-xs text-[#363942]/70">
                              {student.studentEmail}
                            </div>
                          </div>
                        </div>

                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className={`gap-2 ${getStatusColor(status)}`}
                          onClick={() => toggleStudentStatus(student.enrollmentId)}
                        >
                          {getStatusIcon(status)}
                          <span className="capitalize">{status}</span>
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="flex items-center gap-2 text-sm font-medium text-[#17224D]">
                  <AlertCircle className="w-4 h-4 text-[#007FFF]" />
                  <Trans>Session Notes</Trans>
                  <span className="text-xs text-[#363942]/70 font-normal ml-1">
                    (<Trans>Optional</Trans>)
                  </span>
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this session (e.g., topics covered, announcements)"
                  rows={3}
                  className="border-gray-200 hover:border-[#007FFF]/30 focus:ring-[#007FFF] transition-colors resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsMarkDialogOpen(false)}
                  disabled={isLoading}
                  className="h-11"
                >
                  <Trans>Cancel</Trans>
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !selectedDate}
                  className="gap-2 h-11 bg-gradient-to-r from-[#007FFF] to-[#17224D] hover:from-[#0066CC] hover:to-[#17224D] text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <Trans>Marking...</Trans>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <Trans>Mark Attendance</Trans>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-[#17224D]">
            <Trans>Student Attendance</Trans>
          </h2>
        </div>

        {students.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-16 h-16 text-[#363942]/20 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#17224D] mb-2">
              <Trans>No students enrolled</Trans>
            </h3>
            <p className="text-[#363942]/70">
              <Trans>Students will appear here when they enroll in this course</Trans>
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {students.map((student) => (
              <div key={student.enrollmentId} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#007FFF] to-[#17224D] rounded-full flex items-center justify-center text-white font-semibold">
                      {student.studentName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#17224D]">
                        {student.studentName}
                      </h3>
                      <p className="text-sm text-[#363942]/70">{student.studentEmail}</p>
                    </div>
                  </div>

                  {student.attendanceRate !== null && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#007FFF]">
                        {student.attendanceRate}%
                      </div>
                      <div className="text-sm text-[#363942]/70">
                        {student.presentCount} / {student.totalRecords} <Trans>sessions</Trans>
                      </div>
                    </div>
                  )}
                </div>

                {student.attendanceRecords.length === 0 ? (
                  <div className="text-center py-6 bg-[#F4F5F7] rounded-lg">
                    <CalendarCheck className="w-8 h-8 text-[#363942]/20 mx-auto mb-2" />
                    <p className="text-sm text-[#363942]/70">
                      <Trans>No attendance records yet</Trans>
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {student.attendanceRecords.map((record) => (
                      <div
                        key={record.id}
                        className="flex items-center justify-between p-3 bg-[#F4F5F7] rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-sm font-medium text-[#17224D]">
                            {formatDate(record.date, locale)}
                          </div>
                          {record.notes && (
                            <div className="text-sm text-[#363942]/70 italic">
                              "{record.notes}"
                            </div>
                          )}
                        </div>

                        <div
                          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                            record.status
                          )}`}
                        >
                          {getStatusIcon(record.status)}
                          <span className="capitalize">{record.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
