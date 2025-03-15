import type { ColumnDef } from '@tanstack/react-table';
import type { ComponentProps } from 'react';

import type { UsageTracking } from '@/common/types/api/usage-tracking';
import type { Computer } from '@/common/types/api/usage-tracking/computer.type';
import type { User } from '@/common/types/api/user';

import { DataTable, DataTableHeader } from './data-table';

interface UsageTrackingDataTableProps
  extends Omit<ComponentProps<typeof DataTable<UsageTracking>>, 'columns' | 'getRowId'> {
  renderColumns?: (
    existingColumns: typeof usageTrackingDataTableColumns,
  ) => ColumnDef<UsageTracking>[];
}

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

export function UsageTrackingDataTable({ renderColumns, ...props }: UsageTrackingDataTableProps) {
  return (
    <DataTable
      getRowId={(row) => row.id}
      columns={
        renderColumns ? renderColumns(usageTrackingDataTableColumns) : usageTrackingDataTableColumns
      }
      {...props}
    />
  );
}
