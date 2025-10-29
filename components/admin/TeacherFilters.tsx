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

interface TeacherFiltersProps<TData> {
  table: Table<TData>;
}

export function TeacherFilters<TData>({ table }: TeacherFiltersProps<TData>) {
  // Get current filter value
  const statusFilter = table.getColumn('isActive')?.getFilterValue();
  const statusValue = statusFilter === undefined ? 'all' : statusFilter === true ? 'true' : 'false';

  return (
    <div className="flex items-center gap-2">
      {/* Status Filter */}
      <Select
        value={statusValue}
        onValueChange={(value) => {
          if (value === 'all') {
            table.getColumn('isActive')?.setFilterValue(undefined);
          } else {
            table.getColumn('isActive')?.setFilterValue(value === 'true');
          }
        }}
      >
        <SelectTrigger className="h-9 w-[120px] bg-[#F4F5F7] border-0 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <Trans>All Status</Trans>
          </SelectItem>
          <SelectItem value="true">
            <Trans>Active</Trans>
          </SelectItem>
          <SelectItem value="false">
            <Trans>Inactive</Trans>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
