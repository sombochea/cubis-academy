'use client';

import { Table } from '@tanstack/react-table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trans } from '@lingui/react/macro';

interface PaymentFiltersProps<TData> {
  table: Table<TData>;
}

export function PaymentFilters<TData>({ table }: PaymentFiltersProps<TData>) {
  // Get current filter values from table state
  const statusFilter = table.getColumn('status')?.getFilterValue();
  const statusValue = statusFilter === undefined ? 'all' : statusFilter;

  const methodFilter = table.getColumn('method')?.getFilterValue();
  const methodValue = methodFilter === undefined ? 'all' : methodFilter;

  return (
    <div className="flex items-center gap-2">
      <Select
        value={statusValue as string}
        onValueChange={(value) => {
          table.getColumn('status')?.setFilterValue(value === 'all' ? undefined : value);
        }}
      >
        <SelectTrigger className="h-9 w-[140px]">
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

      <Select
        value={methodValue as string}
        onValueChange={(value) => {
          table.getColumn('method')?.setFilterValue(value === 'all' ? undefined : value);
        }}
      >
        <SelectTrigger className="h-9 w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <Trans>All Methods</Trans>
          </SelectItem>
          <SelectItem value="cash">
            <Trans>Cash</Trans>
          </SelectItem>
          <SelectItem value="bank_transfer">
            <Trans>Bank Transfer</Trans>
          </SelectItem>
          <SelectItem value="credit_card">
            <Trans>Credit Card</Trans>
          </SelectItem>
          <SelectItem value="mobile_payment">
            <Trans>Mobile Payment</Trans>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
