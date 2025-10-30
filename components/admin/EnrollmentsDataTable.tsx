'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { EnrollmentFilters } from '@/components/admin/EnrollmentFilters';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { Eye, ArrowUpDown, MoreHorizontal, UserCheck, BookOpen, Trash2 } from 'lucide-react';
import { Trans } from '@lingui/react/macro';
import * as React from 'react';
import { formatDate } from '@/lib/utils/date';

type Enrollment = {
  id: string;
  studentName: string;
  studentSuid: string;
  studentId: string;
  courseTitle: string;
  courseId: string;
  status: 'active' | 'completed' | 'dropped' | 'suspended';
  progress: number;
  enrolled: Date;
  completed: Date | null;
};

interface EnrollmentsDataTableProps {
  data: Enrollment[];
  locale: string;
}

export function EnrollmentsDataTable({ data, locale }: EnrollmentsDataTableProps) {
  const columns: ColumnDef<Enrollment>[] = [
    {
      accessorKey: 'studentName',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="hover:bg-transparent p-0 h-auto font-semibold"
          >
            <Trans>Student</Trans>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-[#17224D]">{row.getValue('studentName')}</div>
          <div className="text-xs text-[#007FFF] font-mono">{row.original.studentSuid}</div>
        </div>
      ),
    },
    {
      accessorKey: 'courseTitle',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="hover:bg-transparent p-0 h-auto font-semibold"
          >
            <Trans>Course</Trans>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="text-[#363942] max-w-xs truncate">{row.getValue('courseTitle')}</div>
      ),
    },
    {
      accessorKey: 'status',
      header: () => <Trans>Status</Trans>,
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return (
          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
            status === 'active'
              ? 'bg-green-100 text-green-700'
              : status === 'completed'
              ? 'bg-blue-100 text-blue-700'
              : status === 'dropped'
              ? 'bg-red-100 text-red-700'
              : 'bg-yellow-100 text-yellow-700'
          }`}>
            <Trans>{status}</Trans>
          </span>
        );
      },
    },
    {
      accessorKey: 'progress',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="hover:bg-transparent p-0 h-auto font-semibold"
          >
            <Trans>Progress</Trans>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const progress = row.getValue('progress') as number;
        return (
          <div className="flex items-center gap-2 min-w-[120px]">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#007FFF] to-[#17224D] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs font-medium text-[#363942] w-10 text-right">{progress}%</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'enrolled',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="hover:bg-transparent p-0 h-auto font-semibold"
          >
            <Trans>Enrolled Date</Trans>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = row.getValue('enrolled') as Date;
        return (
          <div className="text-[#363942] text-sm">
            {formatDate(date, locale) || '-'}
          </div>
        );
      },
    },
    {
      accessorKey: 'completed',
      header: () => <Trans>Completed</Trans>,
      cell: ({ row }) => {
        const date = row.getValue('completed') as Date | null;
        return (
          <div className="text-[#363942] text-sm">
            {formatDate(date, locale) || '-'}
          </div>
        );
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const enrollment = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel><Trans>Actions</Trans></DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/${locale}/admin/enrollments/${enrollment.id}`} className="cursor-pointer">
                  <Eye className="mr-2 h-4 w-4" />
                  <Trans>View details</Trans>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/${locale}/admin/students/${enrollment.studentId}`} className="cursor-pointer">
                  <UserCheck className="mr-2 h-4 w-4" />
                  <Trans>View student</Trans>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/${locale}/admin/courses/${enrollment.courseId}`} className="cursor-pointer">
                  <BookOpen className="mr-2 h-4 w-4" />
                  <Trans>View course</Trans>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link 
                  href={`/${locale}/admin/enrollments/${enrollment.id}/delete`} 
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <Trans>Delete enrollment</Trans>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <DataTable 
      columns={columns} 
      data={data}
      searchKey="studentName"
      searchPlaceholder="Search by student name..."
      filterComponent={(table) => <EnrollmentFilters table={table} />}
      showRowNumber={true}
    />
  );
}
