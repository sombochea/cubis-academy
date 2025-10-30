'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { PaymentFilters } from '@/components/admin/PaymentFilters';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { Eye, ArrowUpDown, MoreHorizontal, UserCheck, BookOpen, CheckCircle, XCircle } from 'lucide-react';
import { Trans } from '@lingui/react/macro';
import * as React from 'react';
import { formatDate } from '@/lib/utils/date';

type Payment = {
  id: string;
  studentName: string;
  studentSuid: string;
  studentId: string;
  courseTitle: string | null;
  courseId: string | null;
  amount: string;
  method: string | null;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  txnId: string | null;
  created: Date;
};

interface PaymentsDataTableProps {
  data: Payment[];
  locale: string;
}

export function PaymentsDataTable({ data, locale }: PaymentsDataTableProps) {
  const columns: ColumnDef<Payment>[] = [
    {
      accessorKey: 'txnId',
      header: () => <Trans>Transaction ID</Trans>,
      cell: ({ row }) => {
        const txnId = row.getValue('txnId') as string | null;
        return (
          <div className="font-mono text-[#007FFF] text-sm">
            {txnId || '-'}
          </div>
        );
      },
    },
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
      header: () => <Trans>Course</Trans>,
      cell: ({ row }) => {
        const courseTitle = row.getValue('courseTitle') as string | null;
        return (
          <div className="text-[#363942] max-w-xs truncate">
            {courseTitle || <span className="text-[#363942]/50"><Trans>General Payment</Trans></span>}
          </div>
        );
      },
    },
    {
      accessorKey: 'amount',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="hover:bg-transparent p-0 h-auto font-semibold"
          >
            <Trans>Amount</Trans>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const amount = row.getValue('amount') as string;
        return (
          <div className="font-semibold text-[#17224D]">
            ${Number(amount).toFixed(2)}
          </div>
        );
      },
    },
    {
      accessorKey: 'method',
      header: () => <Trans>Method</Trans>,
      cell: ({ row }) => {
        const method = row.getValue('method') as string | null;
        return (
          <div className="text-[#363942] capitalize">
            {method || '-'}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: () => <Trans>Status</Trans>,
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return (
          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
            status === 'completed'
              ? 'bg-green-100 text-green-700'
              : status === 'pending'
              ? 'bg-yellow-100 text-yellow-700'
              : status === 'failed'
              ? 'bg-red-100 text-red-700'
              : 'bg-gray-100 text-gray-700'
          }`}>
            <Trans>{status}</Trans>
          </span>
        );
      },
    },
    {
      accessorKey: 'created',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="hover:bg-transparent p-0 h-auto font-semibold"
          >
            <Trans>Date</Trans>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = row.getValue('created') as Date;
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
        const payment = row.original;
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
                <Link href={`/${locale}/admin/payments/${payment.id}`} className="cursor-pointer">
                  <Eye className="mr-2 h-4 w-4" />
                  <Trans>View details</Trans>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/${locale}/admin/students/${payment.studentId}`} className="cursor-pointer">
                  <UserCheck className="mr-2 h-4 w-4" />
                  <Trans>View student</Trans>
                </Link>
              </DropdownMenuItem>
              {payment.courseId && (
                <DropdownMenuItem asChild>
                  <Link href={`/${locale}/admin/courses/${payment.courseId}`} className="cursor-pointer">
                    <BookOpen className="mr-2 h-4 w-4" />
                    <Trans>View course</Trans>
                  </Link>
                </DropdownMenuItem>
              )}
              {payment.status === 'pending' && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link 
                      href={`/${locale}/admin/payments/${payment.id}/approve`} 
                      className="cursor-pointer text-green-600 focus:text-green-600"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      <Trans>Approve payment</Trans>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link 
                      href={`/${locale}/admin/payments/${payment.id}/reject`} 
                      className="cursor-pointer text-red-600 focus:text-red-600"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      <Trans>Reject payment</Trans>
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
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
      filterComponent={(table) => <PaymentFilters table={table} />}
      showRowNumber={true}
    />
  );
}
