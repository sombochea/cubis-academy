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

interface EnrollmentFiltersProps<TData> {
  table: Table<TData>;
}

export function EnrollmentFilters<TData>({ table }: EnrollmentFiltersProps<TData>) {
  // Get current filter value from table state
  const statusFilter = table.getColumn('status')?.getFilterValue();
  const statusValue = statusFilter === undefined ? 'all' : statusFilter;

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
          <SelectItem value="active">
            <Trans>Active</Trans>
          </SelectItem>
          <SelectItem value="completed">
            <Trans>Completed</Trans>
          </SelectItem>
          <SelectItem value="dropped">
            <Trans>Dropped</Trans>
          </SelectItem>
          <SelectItem value="suspended">
            <Trans>Suspended</Trans>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
