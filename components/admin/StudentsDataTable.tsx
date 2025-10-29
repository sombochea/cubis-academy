'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { StudentFilters } from '@/components/admin/StudentFilters';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import Image from 'next/image';
import { Edit, Trash2, ArrowUpDown, MoreHorizontal, Eye, BookOpen } from 'lucide-react';
import { Trans } from '@lingui/react/macro';
import * as React from 'react';

type Student = {
  userId: string;
  suid: string;
  name: string;
  email: string;
  phone: string | null;
  gender: string | null;
  photo: string | null;
  enrolled: Date;
  isActive: boolean;
  enrollmentCount: number;
};

interface StudentsDataTableProps {
  data: Student[];
  locale: string;
}

export function StudentsDataTable({ data, locale }: StudentsDataTableProps) {
  const columns: ColumnDef<Student>[] = [
    {
      accessorKey: 'suid',
      header: () => <Trans>Student ID</Trans>,
      cell: ({ row }) => (
        <div className="font-mono text-[#007FFF] font-medium">{row.getValue('suid')}</div>
      ),
    },
    {
      accessorKey: 'name',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="hover:bg-transparent p-0 h-auto font-semibold"
          >
            <Trans>Name</Trans>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const student = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-[#F4F5F7] flex-shrink-0">
              {student.photo ? (
                <Image
                  src={student.photo}
                  alt={student.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#007FFF] to-[#17224D] text-white font-semibold text-sm">
                  {student.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="font-medium text-[#17224D]">{student.name}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'email',
      header: () => <Trans>Email</Trans>,
      cell: ({ row }) => (
        <div className="text-[#363942]">{row.getValue('email')}</div>
      ),
    },
    {
      accessorKey: 'phone',
      header: () => <Trans>Phone</Trans>,
      cell: ({ row }) => {
        const phone = row.getValue('phone') as string | null;
        return <div className="text-[#363942]">{phone || '-'}</div>;
      },
    },
    {
      accessorKey: 'gender',
      header: () => <Trans>Gender</Trans>,
      cell: ({ row }) => {
        const gender = row.getValue('gender') as string | null;
        return <div className="text-[#363942] capitalize">{gender || '-'}</div>;
      },
    },
    {
      accessorKey: 'enrollmentCount',
      header: () => <Trans>Enrollments</Trans>,
      cell: ({ row }) => {
        const count = row.getValue('enrollmentCount') as number;
        return (
          <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-[#007FFF]/10 text-[#007FFF]">
            {count}
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
              : 'bg-red-100 text-red-700'
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
        const student = row.original;
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
                <Link href={`/${locale}/admin/students/${student.userId}`} className="cursor-pointer">
                  <Eye className="mr-2 h-4 w-4" />
                  <Trans>View details</Trans>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/${locale}/admin/students/${student.userId}/edit`} className="cursor-pointer">
                  <Edit className="mr-2 h-4 w-4" />
                  <Trans>Edit student</Trans>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/${locale}/admin/students/${student.userId}/enrollments`} className="cursor-pointer">
                  <BookOpen className="mr-2 h-4 w-4" />
                  <Trans>View enrollments</Trans>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link 
                  href={`/${locale}/admin/students/${student.userId}/delete`} 
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <Trans>Delete student</Trans>
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
      searchKey="name"
      searchPlaceholder="Search students by name..."
      filterComponent={(table) => <StudentFilters table={table} />}
      showRowNumber={true}
    />
  );
}
