import type { ColumnDef } from '@tanstack/react-table';
import { type ComponentProps } from 'react';

import { DeviceStatus } from '@/common/types';
import type { Computer } from '@/common/types/api/computer';
import { getProviderAsyncSelectOptions } from '@/components/ui/async-select';

import { DataTable, DataTableHeader, type FilterRule } from './data-table';

const computerDataTableColumns: ColumnDef<Computer>[] = [
  {
    id: '#',
    header: '#',
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableHeader column={column} title="Name" />,
  },
  {
    accessorKey: 'position.name',
    header: ({ column }) => <DataTableHeader column={column} title="Position" />,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.getValue<string>('status');
      return <span>{status}</span>;
    },
  },
  {
    accessorKey: 'pricePerHour',
    header: 'Price/Hour',
    cell: ({ row }) => {
      const price = row.getValue<number>('pricePerHour');
      return <span>${price.toFixed(2)}</span>;
    },
  },
  {
    accessorKey: 'provider.name',
    header: 'Provider',
  },
  {
    accessorKey: 'createTimestamp',
    header: ({ column }) => <DataTableHeader column={column} title="Created At" />,
    cell: ({ row }) => {
      const timestamp = row.getValue<string>('createTimestamp');
      if (!timestamp) {
        return <span>N/A</span>;
      }

      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return <span>Invalid date</span>;
      }

      const formattedDate = new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'long',
      }).format(date);

      return <span>{formattedDate}</span>;
    },
  },
];

const filterRules: FilterRule<Computer>[] = [
  { field: 'name', type: 'text' },
  { field: 'provider', type: 'select', async: true, ...getProviderAsyncSelectOptions('name') },
  {
    field: 'status',
    type: 'select',
    multiple: true,
    options: Object.values(DeviceStatus).map((status) => ({ value: status, label: status })),
  },
  { field: 'pricePerHour', type: 'number', range: true, currency: true },
  { field: 'createTimestamp', type: 'datetime', range: true },
  { field: 'deleteTimestamp', type: 'datetime', range: true },
];

interface ComputerDataTableProps
  extends Omit<ComponentProps<typeof DataTable<Computer>>, 'columns' | 'getRowId'> {
  renderColumns?: (existingColumns: typeof computerDataTableColumns) => ColumnDef<Computer>[];
}

export function ComputerDataTable({ renderColumns, filter, ...props }: ComputerDataTableProps) {
  return (
    <DataTable
      getRowId={(row) => row.id}
      columns={!renderColumns ? computerDataTableColumns : renderColumns(computerDataTableColumns)}
      filter={filter}
      filterRules={filterRules}
      {...props}
    />
  );
}
