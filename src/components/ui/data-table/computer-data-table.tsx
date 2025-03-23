import type { ColumnDef } from '@tanstack/react-table';
import { type ComponentProps } from 'react';

import type { Computer } from '@/common/types/api/computer';

import { DataTable, DataTableHeader } from './data-table';

const computerDataTableColumns: ColumnDef<Computer>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => <DataTableHeader column={column} title="ID" />,
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
    header: ({ column }) => <DataTableHeader column={column} title="Price/Hour" />,
    cell: ({ row }) => {
      const price = row.getValue<number>('pricePerHour');
      return <span>${price.toFixed(2)}</span>;
    },
  },
  {
    accessorKey: 'cpu',
    header: ({ column }) => <DataTableHeader column={column} title="CPU" />,
  },
  {
    accessorKey: 'ram',
    header: ({ column }) => <DataTableHeader column={column} title="RAM" />,
  },
  {
    accessorKey: 'storage',
    header: ({ column }) => <DataTableHeader column={column} title="Storage" />,
  },
  {
    accessorKey: 'provider.name',
    header: ({ column }) => <DataTableHeader column={column} title="Provider" />,
  },
  {
    accessorKey: 'peripherals',
    header: ({ column }) => <DataTableHeader column={column} title="Peripherals" />,
    cell: ({ row }) => {
      const rowPeripherals = row.getValue<
        Array<{
          id: string;
          status: string;
          name: string;
        }>
      >('peripherals');

      if (!rowPeripherals || rowPeripherals.length === 0) {
        return <span>No peripherals</span>;
      }

      const peripheralNames = rowPeripherals.map((p) => p.name || 'Unknown').join(', ');
      const peripheralstatus = rowPeripherals.map((p) => p.status || 'Unknown').join(', ');
      return (
        <span>
          {peripheralNames}-{peripheralstatus}
        </span>
      );
    },
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
      {...props}
    />
  );
}
