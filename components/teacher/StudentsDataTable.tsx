'use client';

import * as React from 'react';
import { Trans } from '@lingui/react/macro';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Eye, Mail, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/date';
import { getAvatarGradient, getInitials } from '@/lib/avatar-utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Course {
  courseId: string;
  courseTitle: string;
  progress: number;
  status: string;
  enrolled: Date;
}

interface Student {
  id: string;
  name: string;
  email: string;
  photo: string | null;
  totalCourses: number;
  avgProgress: number;
  lastEnrolled: number;
  courses: Course[];
}

interface StudentsDataTableProps {
  students: Student[];
  locale: string;
}

export function StudentsDataTable({ students, locale }: StudentsDataTableProps) {
  const [progressFilter, setProgressFilter] = React.useState<string>('all');
  const [courseCountFilter, setCourseCountFilter] = React.useState<string>('all');

  // Filter students based on selected filters
  const filteredStudents = React.useMemo(() => {
    let filtered = students;

    // Apply progress filter
    if (progressFilter === 'high') {
      filtered = filtered.filter((s) => s.avgProgress >= 75);
    } else if (progressFilter === 'medium') {
      filtered = filtered.filter((s) => s.avgProgress >= 50 && s.avgProgress < 75);
    } else if (progressFilter === 'low') {
      filtered = filtered.filter((s) => s.avgProgress < 50);
    }

    // Apply course count filter
    if (courseCountFilter === 'single') {
      filtered = filtered.filter((s) => s.totalCourses === 1);
    } else if (courseCountFilter === 'multiple') {
      filtered = filtered.filter((s) => s.totalCourses > 1);
    }

    return filtered;
  }, [students, progressFilter, courseCountFilter]);

  const columns: ColumnDef<Student>[] = [
    {
      accessorKey: 'name',
      header: () => <Trans>Student</Trans>,
      cell: ({ row }) => {
        const student = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-gray-200">
              <AvatarImage src={student.photo || undefined} />
              <AvatarFallback className={`bg-gradient-to-br ${getAvatarGradient(student.id)} text-white font-semibold`}>
                {getInitials(student.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold text-[#17224D]">{student.name}</div>
              <div className="flex items-center gap-1 text-sm text-[#363942]/70">
                <Mail className="w-3 h-3" />
                {student.email}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'totalCourses',
      header: () => <Trans>Courses</Trans>,
      cell: ({ row }) => {
        const student = row.original;
        return (
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#007FFF]" />
            <span className="font-medium text-[#17224D]">{student.totalCourses}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'avgProgress',
      header: () => <Trans>Avg Progress</Trans>,
      cell: ({ row }) => {
        const progress = row.original.avgProgress;
        return (
          <div className="flex items-center gap-2">
            <div className="flex-1 max-w-[120px]">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    progress >= 75
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                      : progress >= 50
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                      : 'bg-gradient-to-r from-red-500 to-pink-500'
                  }`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
            <span className="text-sm font-semibold text-[#007FFF] min-w-[45px]">
              {progress}%
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'courses',
      header: () => <Trans>Enrolled Courses</Trans>,
      cell: ({ row }) => {
        const student = row.original;
        return (
          <div className="flex flex-wrap gap-1.5">
            {student.courses.slice(0, 3).map((course) => (
              <span
                key={course.courseId}
                className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs font-medium"
              >
                {course.courseTitle}
              </span>
            ))}
            {student.courses.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                +{student.courses.length - 3} more
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'lastEnrolled',
      header: () => <Trans>Last Enrolled</Trans>,
      cell: ({ row }) => {
        return (
          <div className="text-sm text-[#363942]/70">
            {formatDate(new Date(row.original.lastEnrolled), locale)}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: () => <Trans>Actions</Trans>,
      cell: ({ row }) => {
        const student = row.original;
        return (
          <Link href={`/${locale}/teacher/students/${student.id}`}>
            <Button size="sm" variant="outline" className="gap-2">
              <Eye className="w-4 h-4" />
              <Trans>View</Trans>
            </Button>
          </Link>
        );
      },
    },
  ];

  // Custom filter component
  const StudentFilters = () => {
    return (
      <div className="flex items-center gap-3">
        {/* Progress Filter */}
        <Select value={progressFilter} onValueChange={setProgressFilter}>
          <SelectTrigger className="h-9 w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <Trans>All Progress</Trans>
            </SelectItem>
            <SelectItem value="high">
              <Trans>High (≥75%)</Trans>
            </SelectItem>
            <SelectItem value="medium">
              <Trans>Medium (50-74%)</Trans>
            </SelectItem>
            <SelectItem value="low">
              <Trans>Low (&lt;50%)</Trans>
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Course Count Filter */}
        <Select value={courseCountFilter} onValueChange={setCourseCountFilter}>
          <SelectTrigger className="h-9 w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <Trans>All Courses</Trans>
            </SelectItem>
            <SelectItem value="single">
              <Trans>Single Course</Trans>
            </SelectItem>
            <SelectItem value="multiple">
              <Trans>Multiple Courses</Trans>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-[#17224D]">
          <Trans>All Students</Trans>
        </h2>
        <p className="text-sm text-[#363942]/70 mt-1">
          <Trans>Filter and search through your students</Trans>
        </p>
      </div>

      <div className="p-6">
        <DataTable
          columns={columns}
          data={filteredStudents}
          searchKey="name"
          searchPlaceholder="Search students by name or email..."
          showRowNumber={true}
          filterComponent={() => <StudentFilters />}
        />
      </div>
    </div>
  );
}
