import type { ColumnDef } from '@tanstack/react-table';
import { type ComponentProps } from 'react';

import type { Computer } from '@/common/types/api/computer';
import { PositionStatus } from '@/common/types/api/position/position-status.type';

import { DataTable, DataTableHeader, type FilterRule } from './data-table';

function getPositionStatusClass(status: PositionStatus) {
  switch (status) {
    case PositionStatus.AVAILABLE:
      return 'text-green-600';
    case PositionStatus.IN_USE:
      return 'text-red-600';
    default:
      return 'text-amber-600';
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
      return row.original.position?.name || 'N/A';
    },
  },
  {
    accessorKey: 'position.status',
    header: ({ column }) => <DataTableHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.original.position?.status as PositionStatus;
      return (
        <div className={`capitalize ${getPositionStatusClass(status)}`}>
          {status?.toLowerCase().replace('_', ' ') || 'N/A'}
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
    field: 'position', //FIXME: This should be position.status
    type: 'select',
    options: Object.values(PositionStatus).map((status) => ({ label: status, value: status })),
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
