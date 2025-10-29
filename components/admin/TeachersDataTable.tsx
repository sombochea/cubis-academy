'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Edit, Trash2, BookOpen, ArrowUpDown } from 'lucide-react';
import { Trans } from '@lingui/react/macro';

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
      header: () => <div className="text-right"><Trans>Actions</Trans></div>,
      cell: ({ row }) => {
        const teacher = row.original;
        return (
          <div className="flex items-center justify-end gap-2">
            <Link
              href={`/${locale}/admin/teachers/${teacher.userId}/courses`}
              className="p-2 text-[#007FFF] hover:bg-[#007FFF]/10 rounded-lg transition-colors"
              title="Assign Courses"
            >
              <BookOpen className="w-4 h-4" />
            </Link>
            <Link
              href={`/${locale}/admin/teachers/${teacher.userId}/edit`}
              className="p-2 text-[#007FFF] hover:bg-[#007FFF]/10 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
            </Link>
            <Link
              href={`/${locale}/admin/teachers/${teacher.userId}/delete`}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </Link>
          </div>
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
    />
  );
}
