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
import { Edit, Trash2, MoreHorizontal, ArrowUpDown } from 'lucide-react';
import { Trans } from '@lingui/react/macro';
import * as React from 'react';

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  isActive: boolean;
  created: Date;
};

interface CategoriesDataTableProps {
  data: Category[];
  locale: string;
}

export function CategoriesDataTable({ data, locale }: CategoriesDataTableProps) {
  const columns: ColumnDef<Category>[] = [
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
        const category = row.original;
        return (
          <div className="flex items-center gap-3">
            {category.icon && (
              <span className="text-2xl">{category.icon}</span>
            )}
            <div>
              <div className="font-medium text-[#17224D]">{category.name}</div>
              <div className="text-sm text-gray-500">{category.slug}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'description',
      header: () => <Trans>Description</Trans>,
      cell: ({ row }) => {
        const desc = row.getValue('description') as string | null;
        return (
          <div className="text-[#363942] max-w-md truncate">
            {desc || '-'}
          </div>
        );
      },
    },
    {
      accessorKey: 'color',
      header: () => <Trans>Color</Trans>,
      cell: ({ row }) => {
        const color = row.getValue('color') as string | null;
        return color ? (
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded border border-gray-300"
              style={{ backgroundColor: color }}
            />
            <span className="text-sm text-gray-600">{color}</span>
          </div>
        ) : (
          <span className="text-gray-400">-</span>
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
        const category = row.original;
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
                <Link href={`/${locale}/admin/categories/${category.id}/edit`} className="cursor-pointer">
                  <Edit className="mr-2 h-4 w-4" />
                  <Trans>Edit category</Trans>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link 
                  href={`/${locale}/admin/categories/${category.id}/delete`} 
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <Trans>Delete category</Trans>
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
      searchPlaceholder="Search categories..."
      showRowNumber={true}
    />
  );
}
