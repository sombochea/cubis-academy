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

interface StudentFiltersProps<TData> {
  table: Table<TData>;
}

export function StudentFilters<TData>({ table }: StudentFiltersProps<TData>) {
  // Get current filter values
  const statusFilter = table.getColumn('isActive')?.getFilterValue();
  const statusValue = statusFilter === undefined ? 'all' : statusFilter === true ? 'true' : 'false';
  
  const genderFilter = table.getColumn('gender')?.getFilterValue() as string | undefined;
  const genderValue = genderFilter ?? 'all';

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

      {/* Gender Filter */}
      <Select
        value={genderValue}
        onValueChange={(value) => {
          if (value === 'all') {
            table.getColumn('gender')?.setFilterValue(undefined);
          } else {
            table.getColumn('gender')?.setFilterValue(value);
          }
        }}
      >
        <SelectTrigger className="h-9 w-[120px] bg-[#F4F5F7] border-0 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <Trans>All Gender</Trans>
          </SelectItem>
          <SelectItem value="male">
            <Trans>Male</Trans>
          </SelectItem>
          <SelectItem value="female">
            <Trans>Female</Trans>
          </SelectItem>
          <SelectItem value="other">
            <Trans>Other</Trans>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
