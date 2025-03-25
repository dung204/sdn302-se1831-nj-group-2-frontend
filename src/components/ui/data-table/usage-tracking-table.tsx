import type { ColumnDef } from '@tanstack/react-table';
import type { ComponentProps } from 'react';

import type { UsageTracking } from '@/common/types/api/usage-tracking';
import type { Computer } from '@/common/types/api/usage-tracking/computer.type';
import type { User } from '@/common/types/api/user';
import {
  getComputerAsyncSelectOptions,
  getUserAsyncSelectOptions,
} from '@/components/ui/async-select';

import { DataTable, DataTableHeader, type FilterRule } from './data-table';

interface UsageTrackingDataTableProps
  extends Omit<ComponentProps<typeof DataTable<UsageTracking>>, 'columns' | 'getRowId'> {
  renderColumns?: (
    existingColumns: typeof usageTrackingDataTableColumns,
  ) => ColumnDef<UsageTracking>[];
}

const filterRules: FilterRule<UsageTracking>[] = [
  {
    field: 'user',
    type: 'select',
    async: true,
    ...getUserAsyncSelectOptions('firstName'),
  },
  { field: 'computer', type: 'select', async: true, ...getComputerAsyncSelectOptions('name') },
  { field: 'startTimeStamp', type: 'datetime' },
  { field: 'endTimeStamp', type: 'datetime' },
  { field: 'createTimestamp', type: 'datetime' },
];

const usageTrackingDataTableColumns = [
  {
    accessorKey: 'id',
    header: ({ column }) => <DataTableHeader column={column} title="ID" />,
  },
  {
    accessorKey: 'user',
    header: 'User',
    cell: ({ row }) => {
      const user = row.getValue<User>('user');
      return <span>{`${user.firstName} ${user.lastName}`} </span>;
    },
  },
  {
    accessorKey: 'computer',
    header: 'Computer',
    cell: ({ row }) => {
      const computer = row.getValue<Computer>('computer');
      return <span>{`${computer.name}`} </span>;
    },
  },
  {
    accessorKey: 'startTimeStamp',
    header: ({ column }) => <DataTableHeader column={column} title="Start At" />,
    cell: ({ row }) => {
      const date = new Date(row.getValue<string>('startTimeStamp'));
      const formattedDate = new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'long',
      }).format(date);

      return <span>{formattedDate}</span>;
    },
  },
  {
    accessorKey: 'endTimeStamp',
    header: ({ column }) => <DataTableHeader column={column} title="End At" />,
    cell: ({ row }) => {
      const date = new Date(row.getValue<string>('endTimeStamp'));
      const formattedDate = new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'long',
      }).format(date);

      return <span>{formattedDate}</span>;
    },
  },
  {
    accessorKey: 'createTimestamp',
    header: ({ column }) => <DataTableHeader column={column} title="Created At" />,
    cell: ({ row }) => {
      const date = new Date(row.getValue<string>('createTimestamp'));
      const formattedDate = new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'long',
      }).format(date);

      return <span>{formattedDate}</span>;
    },
  },
] as const satisfies ColumnDef<UsageTracking>[];

export function UsageTrackingDataTable({
  renderColumns,
  filter,
  ...props
}: UsageTrackingDataTableProps) {
  return (
    <DataTable
      getRowId={(row) => row.id}
      columns={
        renderColumns ? renderColumns(usageTrackingDataTableColumns) : usageTrackingDataTableColumns
      }
      filterRules={filterRules}
      filter={filter}
      {...props}
    />
  );
}
