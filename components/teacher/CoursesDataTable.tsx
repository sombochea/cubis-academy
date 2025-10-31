'use client';

import * as React from 'react';
import { Trans } from '@lingui/react/macro';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import {
  Eye,
  Edit,
  Users,
  MoreVertical,
  Calendar,
  Award,
  CalendarCheck,
} from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/date';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Course {
  id: string;
  title: string;
  desc: string | null;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  price: string;
  duration: string | null;
  deliveryMode: 'online' | 'face_to_face' | 'hybrid';
  isActive: boolean;
  created: Date;
  enrollmentCount: number;
}

interface CoursesDataTableProps {
  courses: Course[];
  locale: string;
}

export function CoursesDataTable({ courses, locale }: CoursesDataTableProps) {
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [levelFilter, setLevelFilter] = React.useState<string>('all');
  const [categoryFilter, setCategoryFilter] = React.useState<string>('all');

  // Get unique categories
  const categories = React.useMemo(() => {
    const uniqueCategories = Array.from(new Set(courses.map((c) => c.category)));
    return uniqueCategories.sort();
  }, [courses]);

  // Filter courses based on selected filters
  const filteredCourses = React.useMemo(() => {
    let filtered = courses;

    // Apply status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter((c) => c.isActive);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter((c) => !c.isActive);
    }

    // Apply level filter
    if (levelFilter !== 'all') {
      filtered = filtered.filter((c) => c.level === levelFilter);
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((c) => c.category === categoryFilter);
    }

    return filtered;
  }, [courses, statusFilter, levelFilter, categoryFilter]);

  const columns: ColumnDef<Course>[] = [
    {
      accessorKey: 'title',
      header: () => <Trans>Course</Trans>,
      cell: ({ row }) => {
        const course = row.original;
        return (
          <div className="min-w-[200px]">
            <div className="font-semibold text-[#17224D] mb-1">
              {course.title}
            </div>
            {course.desc && (
              <div className="text-sm text-[#363942]/70 line-clamp-1">
                {course.desc}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'category',
      header: () => <Trans>Category</Trans>,
      cell: ({ row }) => {
        return (
          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs font-semibold">
            {row.original.category}
          </span>
        );
      },
    },
    {
      accessorKey: 'level',
      header: () => <Trans>Level</Trans>,
      cell: ({ row }) => {
        const level = row.original.level;
        const levelConfig = {
          beginner: {
            label: 'Beginner',
            color: 'bg-gradient-to-r from-green-500 to-emerald-500',
          },
          intermediate: {
            label: 'Intermediate',
            color: 'bg-gradient-to-r from-yellow-500 to-orange-500',
          },
          advanced: {
            label: 'Advanced',
            color: 'bg-gradient-to-r from-red-500 to-pink-500',
          },
        };
        return (
          <span
            className={`px-2.5 py-1 rounded text-xs font-semibold text-white ${levelConfig[level].color}`}
          >
            {levelConfig[level].label}
          </span>
        );
      },
    },
    {
      accessorKey: 'enrollmentCount',
      header: () => (
        <div className="text-center">
          <Trans>Students</Trans>
        </div>
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-center gap-2">
            <Users className="w-4 h-4 text-[#007FFF]" />
            <span className="font-medium text-[#17224D]">
              {row.original.enrollmentCount}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'price',
      header: () => (
        <div className="text-right">
          <Trans>Price</Trans>
        </div>
      ),
      cell: ({ row }) => {
        return (
          <div className="text-right font-semibold text-[#17224D]">
            ${Number(row.original.price).toFixed(2)}
          </div>
        );
      },
    },
    {
      accessorKey: 'isActive',
      header: () => <Trans>Status</Trans>,
      cell: ({ row }) => {
        const isActive = row.original.isActive;
        return (
          <span
            className={`px-2.5 py-1 rounded text-xs font-semibold ${
              isActive
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-gray-50 text-gray-700 border border-gray-200'
            }`}
          >
            {isActive ? <Trans>Active</Trans> : <Trans>Inactive</Trans>}
          </span>
        );
      },
    },
    {
      accessorKey: 'created',
      header: () => <Trans>Created</Trans>,
      cell: ({ row }) => {
        return (
          <div className="text-sm text-[#363942]/70">
            {formatDate(row.original.created, locale)}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: () => (
        <div className="text-center">
          <Trans>Actions</Trans>
        </div>
      ),
      cell: ({ row }) => {
        const course = row.original;
        return (
          <div className="flex justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-gray-100"
                >
                  <span className="sr-only">
                    <Trans>Open menu</Trans>
                  </span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[180px]">
                <DropdownMenuLabel className="text-xs font-medium text-[#363942]/70">
                  <Trans>Course Actions</Trans>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href={`/${locale}/teacher/courses/${course.id}`}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Eye className="w-4 h-4 text-[#007FFF]" />
                    <span>
                      <Trans>View Details</Trans>
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href={`/${locale}/teacher/courses/${course.id}/edit`}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Edit className="w-4 h-4 text-[#007FFF]" />
                    <span>
                      <Trans>Edit Course</Trans>
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href={`/${locale}/teacher/courses/${course.id}/schedules`}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 text-purple-600" />
                    <span>
                      <Trans>Schedules</Trans>
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href={`/${locale}/teacher/courses/${course.id}/scores`}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Award className="w-4 h-4 text-yellow-600" />
                    <span>
                      <Trans>Grades</Trans>
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href={`/${locale}/teacher/courses/${course.id}/attendance`}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <CalendarCheck className="w-4 h-4 text-green-600" />
                    <span>
                      <Trans>Attendance</Trans>
                    </span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  // Custom filter component
  const CourseFilters = () => {
    return (
      <div className="flex items-center gap-3">
        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <Trans>All Status</Trans>
            </SelectItem>
            <SelectItem value="active">
              <Trans>Active</Trans>
            </SelectItem>
            <SelectItem value="inactive">
              <Trans>Inactive</Trans>
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Level Filter */}
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <Trans>All Levels</Trans>
            </SelectItem>
            <SelectItem value="beginner">
              <Trans>Beginner</Trans>
            </SelectItem>
            <SelectItem value="intermediate">
              <Trans>Intermediate</Trans>
            </SelectItem>
            <SelectItem value="advanced">
              <Trans>Advanced</Trans>
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Category Filter */}
        {categories.length > 0 && (
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-9 w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <Trans>All Categories</Trans>
              </SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    );
  };

  return (
    <DataTable
      columns={columns}
      data={filteredCourses}
      searchKey="title"
      searchPlaceholder="Search courses by title..."
      showRowNumber={true}
      filterComponent={() => <CourseFilters />}
    />
  );
}
