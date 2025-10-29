'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { CourseFilters } from '@/components/admin/CourseFilters';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { Edit, Trash2, Eye, ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { Trans } from '@lingui/react/macro';
import * as React from 'react';

type Course = {
  id: string;
  title: string;
  category: string | null;
  teacherName: string | null;
  price: string;
  duration: number | null;
  level: 'beginner' | 'intermediate' | 'advanced';
  isActive: boolean;
};

interface CoursesDataTableProps {
  data: Course[];
  locale: string;
}

export function CoursesDataTable({ data, locale }: CoursesDataTableProps) {
  const columns: ColumnDef<Course>[] = [
    {
      accessorKey: 'title',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="hover:bg-transparent p-0 h-auto font-semibold"
          >
            <Trans>Title</Trans>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="font-medium text-[#17224D]">{row.getValue('title')}</div>
      ),
    },
    {
      accessorKey: 'category',
      header: () => <Trans>Category</Trans>,
      cell: ({ row }) => {
        const category = row.getValue('category') as string | null;
        return <div className="text-[#363942]">{category || '-'}</div>;
      },
    },
    {
      accessorKey: 'teacherName',
      header: () => <Trans>Teacher</Trans>,
      cell: ({ row }) => {
        const teacherName = row.getValue('teacherName') as string | null;
        return (
          <div className="text-[#363942]">
            {teacherName || <span className="text-[#363942]/50"><Trans>Unassigned</Trans></span>}
          </div>
        );
      },
    },
    {
      accessorKey: 'price',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="hover:bg-transparent p-0 h-auto font-semibold"
          >
            <Trans>Price</Trans>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const price = row.getValue('price') as string;
        return <div className="text-[#363942]">${Number(price).toFixed(2)}</div>;
      },
    },
    {
      accessorKey: 'duration',
      header: () => <Trans>Duration</Trans>,
      cell: ({ row }) => {
        const duration = row.getValue('duration') as number | null;
        return <div className="text-[#363942]">{duration}h</div>;
      },
    },
    {
      accessorKey: 'level',
      header: () => <Trans>Level</Trans>,
      cell: ({ row }) => {
        const level = row.getValue('level') as string;
        return (
          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
            level === 'beginner' 
              ? 'bg-green-100 text-green-700'
              : level === 'intermediate'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-red-100 text-red-700'
          }`}>
            <Trans>{level}</Trans>
          </span>
        );
      },
    },
    {
      accessorKey: 'isActive',
      header: () => <Trans>Status</Trans>,
      cell: ({ row }) => {
        const isActive = row.getValue('isActive') as boolean;
        return (
          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
            isActive 
              ? 'bg-green-100 text-green-700' 
              : 'bg-gray-100 text-gray-700'
          }`}>
            {isActive ? <Trans>Active</Trans> : <Trans>Inactive</Trans>}
          </span>
        );
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const course = row.original;
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
                <Link href={`/${locale}/admin/courses/${course.id}`} className="cursor-pointer">
                  <Eye className="mr-2 h-4 w-4" />
                  <Trans>View details</Trans>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/${locale}/admin/courses/${course.id}/edit`} className="cursor-pointer">
                  <Edit className="mr-2 h-4 w-4" />
                  <Trans>Edit course</Trans>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link 
                  href={`/${locale}/admin/courses/${course.id}/delete`} 
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <Trans>Delete course</Trans>
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
      searchKey="title"
      searchPlaceholder="Search courses by title..."
      filterComponent={(table) => <CourseFilters table={table} />}
      showRowNumber={true}
    />
  );
}
