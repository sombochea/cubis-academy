'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { Edit, Trash2, BookOpen, ArrowUpDown, MoreHorizontal, Eye } from 'lucide-react';
import { Trans } from '@lingui/react/macro';
import * as React from 'react';

type Teacher = {
  userId: string;
  name: string;
  email: string;
  phone: string | null;
  bio: string | null;
  spec: string | null;
  isActive: boolean;
};

interface TeachersDataTableProps {
  data: Teacher[];
  locale: string;
}

export function TeachersDataTable({ data, locale }: TeachersDataTableProps) {
  const columns: ColumnDef<Teacher>[] = [
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
      cell: ({ row }) => (
        <div className="font-medium text-[#17224D]">{row.getValue('name')}</div>
      ),
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
      accessorKey: 'spec',
      header: () => <Trans>Specialization</Trans>,
      cell: ({ row }) => {
        const spec = row.getValue('spec') as string | null;
        return <div className="text-[#363942]">{spec || '-'}</div>;
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
        const teacher = row.original;
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
                <Link href={`/${locale}/admin/teachers/${teacher.userId}`} className="cursor-pointer">
                  <Eye className="mr-2 h-4 w-4" />
                  <Trans>View details</Trans>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/${locale}/admin/teachers/${teacher.userId}/edit`} className="cursor-pointer">
                  <Edit className="mr-2 h-4 w-4" />
                  <Trans>Edit teacher</Trans>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/${locale}/admin/teachers/${teacher.userId}/courses`} className="cursor-pointer">
                  <BookOpen className="mr-2 h-4 w-4" />
                  <Trans>Assign courses</Trans>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link 
                  href={`/${locale}/admin/teachers/${teacher.userId}/delete`} 
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <Trans>Delete teacher</Trans>
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
      searchPlaceholder="Search teachers by name..."
      showRowNumber={true}
    />
  );
}
