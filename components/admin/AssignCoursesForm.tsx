'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trans } from '@lingui/react/macro';
import { BookOpen, Plus, X, Search, Loader2 } from 'lucide-react';

type Course = {
  id: string;
  title: string;
  category: string | null;
  level: 'beginner' | 'intermediate' | 'advanced';
  isActive: boolean;
};

interface AssignCoursesFormProps {
  teacherId: string;
  teacherName: string;
  assignedCourses: Course[];
  availableCourses: Course[];
  locale: string;
}

export function AssignCoursesForm({
  teacherId,
  teacherName,
  assignedCourses: initialAssigned,
  availableCourses: initialAvailable,
  locale,
}: AssignCoursesFormProps) {
  const router = useRouter();
  const [assignedCourses, setAssignedCourses] = useState<Course[]>(initialAssigned);
  const [availableCourses, setAvailableCourses] = useState<Course[]>(initialAvailable);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const filteredAvailable = availableCourses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssign = (course: Course) => {
    setAvailableCourses(prev => prev.filter(c => c.id !== course.id));
    setAssignedCourses(prev => [...prev, course]);
  };

  const handleUnassign = (course: Course) => {
    setAssignedCourses(prev => prev.filter(c => c.id !== course.id));
    setAvailableCourses(prev => [...prev, course].sort((a, b) => a.title.localeCompare(b.title)));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const courseIds = assignedCourses.map(c => c.id);
      
      const response = await fetch(`/api/admin/teachers/${teacherId}/assign-courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseIds }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to assign courses');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/${locale}/admin/teachers/${teacherId}`);
        router.refresh();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-600">
            <Trans>Courses assigned successfully!</Trans>
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Courses */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-[#F4F5F7]">
            <h3 className="text-lg font-bold text-[#17224D] mb-3">
              <Trans>Available Courses</Trans>
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#363942]/40" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-white"
              />
            </div>
          </div>

          <div className="p-4 max-h-[500px] overflow-y-auto">
            {filteredAvailable.length > 0 ? (
              <div className="space-y-2">
                {filteredAvailable.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between p-3 bg-[#F4F5F7] rounded-lg hover:bg-[#007FFF]/5 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#17224D] truncate">{course.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {course.category && (
                          <span className="text-xs text-[#363942]/70">{course.category}</span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          course.level === 'beginner' 
                            ? 'bg-green-100 text-green-700'
                            : course.level === 'intermediate'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {course.level}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleAssign(course)}
                      className="ml-2 text-[#007FFF] hover:text-[#007FFF] hover:bg-[#007FFF]/10"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-[#363942]/20 mx-auto mb-2" />
                <p className="text-sm text-[#363942]/70">
                  {searchTerm ? <Trans>No courses found</Trans> : <Trans>All courses assigned</Trans>}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Assigned Courses */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-[#007FFF] to-[#17224D]">
            <h3 className="text-lg font-bold text-white">
              <Trans>Assigned Courses</Trans> ({assignedCourses.length})
            </h3>
          </div>

          <div className="p-4 max-h-[500px] overflow-y-auto">
            {assignedCourses.length > 0 ? (
              <div className="space-y-2">
                {assignedCourses.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between p-3 bg-[#007FFF]/5 border border-[#007FFF]/20 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#17224D] truncate">{course.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {course.category && (
                          <span className="text-xs text-[#363942]/70">{course.category}</span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          course.level === 'beginner' 
                            ? 'bg-green-100 text-green-700'
                            : course.level === 'intermediate'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {course.level}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleUnassign(course)}
                      className="ml-2 text-red-600 hover:text-red-600 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-[#363942]/20 mx-auto mb-2" />
                <p className="text-sm text-[#363942]/70">
                  <Trans>No courses assigned yet</Trans>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 pt-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          <Trans>Cancel</Trans>
        </Button>
        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="bg-gradient-to-r from-[#007FFF] to-[#17224D] text-white"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <Trans>Saving...</Trans>
            </>
          ) : (
            <Trans>Save Assignments</Trans>
          )}
        </Button>
      </div>
    </div>
  );
}
