import type { ColumnDef } from '@tanstack/react-table';
import { type ComponentProps } from 'react';

import { DeviceStatus } from '@/common/types';
import type { Computer } from '@/common/types/api/computer';

import { DataTable, DataTableHeader, type FilterRule } from './data-table';

function getStatusClass(status: DeviceStatus) {
  switch (status) {
    case DeviceStatus.NORMAL:
      return 'text-green-600';
    case DeviceStatus.MAINTENANCE:
      return 'text-amber-600';
    default:
      return 'text-red-600';
  }
}

const computerDataTableGuestColumns = [
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableHeader column={column} title="Computer Name" />,
  },
  {
    accessorKey: 'position',
    header: 'Position',
    cell: ({ row }) => {
      const status = row.original.status as DeviceStatus;
      return <span className={getStatusClass(status)}>{status}</span>;
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <div className={`capitalize ${getStatusClass(status)}`}>
          {status?.toLowerCase().replace('_', ' ')}
        </div>
      );
    },
  },
  {
    accessorKey: 'pricePerHour',
    header: ({ column }) => <DataTableHeader column={column} title="Price Per Hour" />,
    cell: ({ row }) => `$${row.original.pricePerHour.toFixed(2)}`,
  },
] as const satisfies ColumnDef<Computer>[];

const filterRules: FilterRule<Computer>[] = [
  { field: 'name', type: 'text' },
  {
    field: 'status',
    type: 'select',
    options: Object.values(DeviceStatus).map((status) => ({ label: status, value: status })),
  },
  { field: 'pricePerHour', type: 'number', range: true },
];

interface ComputerDataTableGuestProps
  extends Omit<ComponentProps<typeof DataTable<Computer>>, 'columns' | 'getRowId'> {
  renderColumns?: (existingColumns: typeof computerDataTableGuestColumns) => ColumnDef<Computer>[];
}

export function ComputerDataTableGuest({
  renderColumns,
  filter,
  ...props
}: ComputerDataTableGuestProps) {
  return (
    <DataTable
      getRowId={(row) => row.id}
      columns={
        !renderColumns
          ? computerDataTableGuestColumns
          : renderColumns(computerDataTableGuestColumns)
      }
      filterRules={filterRules}
      filter={filter}
      {...props}
    />
  );
}
