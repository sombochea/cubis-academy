'use client';

import { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { Trans } from '@lingui/react/macro';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Download,
  Printer,
  FileText,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

type Payment = {
  id: string;
  enrollmentId: string | null;
  courseId: string | null;
  courseTitle: string | null;
  amount: string;
  method: string | null;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  txnId: string | null;
  proofUrl: string | null;
  notes: string | null;
  created: Date;
  totalAmount: string | null;
  paidAmount: string | null;
};

interface PaymentsDataTableProps {
  payments: Payment[];
  locale: string;
}

export function PaymentsDataTable({ payments, locale }: PaymentsDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Payment-History-${new Date().toISOString().split('T')[0]}`,
  });

  const columns: ColumnDef<Payment>[] = useMemo(
    () => [
      {
        accessorKey: 'created',
        header: () => <Trans>Date</Trans>,
        cell: ({ row }) => (
          <div className="text-sm">
            {new Date(row.original.created).toLocaleDateString()}
          </div>
        ),
      },
      {
        accessorKey: 'courseTitle',
        header: () => <Trans>Course</Trans>,
        cell: ({ row }) => (
          <div className="font-medium text-[#17224D]">
            {row.original.courseTitle}
          </div>
        ),
      },
      {
        accessorKey: 'amount',
        header: () => <Trans>Amount</Trans>,
        cell: ({ row }) => (
          <div className="font-bold text-[#007FFF]">
            ${Number(row.original.amount).toFixed(2)}
          </div>
        ),
      },
      {
        accessorKey: 'method',
        header: () => <Trans>Method</Trans>,
        cell: ({ row }) => (
          <div className="text-sm capitalize">{row.original.method || '-'}</div>
        ),
      },
      {
        accessorKey: 'status',
        header: () => <Trans>Status</Trans>,
        cell: ({ row }) => (
          <span
            className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
              row.original.status === 'completed'
                ? 'bg-green-100 text-green-700'
                : row.original.status === 'pending'
                ? 'bg-yellow-100 text-yellow-700'
                : row.original.status === 'failed'
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            <Trans>{row.original.status}</Trans>
          </span>
        ),
      },
      {
        accessorKey: 'txnId',
        header: () => <Trans>Transaction ID</Trans>,
        cell: ({ row }) => (
          <div className="text-sm font-mono text-[#363942]/70">
            {row.original.txnId || '-'}
          </div>
        ),
      },
      {
        id: 'actions',
        header: () => <Trans>Actions</Trans>,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Link href={`/${locale}/student/payments/${row.original.id}`}>
              <Button variant="ghost" size="sm" className="h-8 px-2" title="View Details">
                <Eye className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        ),
      },
    ],
    []
  );

  const filteredData = useMemo(() => {
    return payments.filter((payment) => {
      if (statusFilter !== 'all' && payment.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [payments, statusFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div>
      {/* Filters and Actions */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#363942]/40" />
              <Input
                type="text"
                placeholder="Search payments..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <Trans>All Status</Trans>
                </SelectItem>
                <SelectItem value="pending">
                  <Trans>Pending</Trans>
                </SelectItem>
                <SelectItem value="completed">
                  <Trans>Completed</Trans>
                </SelectItem>
                <SelectItem value="failed">
                  <Trans>Failed</Trans>
                </SelectItem>
                <SelectItem value="refunded">
                  <Trans>Refunded</Trans>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              <Trans>Print</Trans>
            </Button>
          </div>
        </div>

        <div className="mt-4 text-sm text-[#363942]/70">
          <Trans>
            Showing {table.getFilteredRowModel().rows.length} of {payments.length} payments
          </Trans>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    <Trans>No payments found</Trans>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#363942]/70">
              <Trans>Rows per page:</Trans>
            </span>
            <Select
              value={table.getState().pagination.pageSize.toString()}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger className="w-[70px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 30, 50].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-[#363942]/70">
              <Trans>
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </Trans>
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Print View (Hidden) */}
      <div className="hidden">
        <div ref={printRef} className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">CUBIS Academy</h1>
            <h2 className="text-xl mb-4">Payment History</h2>
            <p className="text-sm text-gray-600">
              Generated on {new Date().toLocaleDateString()}
            </p>
          </div>

          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left p-2">Date</th>
                <th className="text-left p-2">Course</th>
                <th className="text-right p-2">Amount</th>
                <th className="text-left p-2">Method</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Transaction ID</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((payment) => (
                <tr key={payment.id} className="border-b border-gray-200">
                  <td className="p-2">{new Date(payment.created).toLocaleDateString()}</td>
                  <td className="p-2">{payment.courseTitle}</td>
                  <td className="p-2 text-right">${Number(payment.amount).toFixed(2)}</td>
                  <td className="p-2 capitalize">{payment.method || '-'}</td>
                  <td className="p-2 capitalize">{payment.status}</td>
                  <td className="p-2 text-sm">{payment.txnId || '-'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-300 font-bold">
                <td colSpan={2} className="p-2">
                  Total
                </td>
                <td className="p-2 text-right">
                  $
                  {filteredData
                    .filter((p) => p.status === 'completed')
                    .reduce((sum, p) => sum + Number(p.amount), 0)
                    .toFixed(2)}
                </td>
                <td colSpan={3}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
