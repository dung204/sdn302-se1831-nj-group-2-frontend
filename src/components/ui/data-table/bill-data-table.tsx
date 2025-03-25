import type { ColumnDef } from '@tanstack/react-table';
import { type ComponentProps } from 'react';

import type { Bill } from '@/common/types/api/bill';
import {
  getComputerAsyncSelectOptions,
  getUserAsyncSelectOptions,
} from '@/components/ui/async-select';

import { Badge } from '../badge';
import { DataTable, DataTableHeader, type FilterRule } from './data-table';

const billDataTableColumns = [
  {
    accessorKey: 'id',
    header: ({ column }) => <DataTableHeader column={column} title="ID" />,
  },
  {
    accessorKey: 'user',
    header: ({ column }) => <DataTableHeader column={column} title="User" />,
    cell: ({ row }) => {
      const user = row.original.user;
      return <span>{`${user.firstName} ${user.lastName}`}</span>;
    },
  },
  {
    accessorKey: 'computer',
    header: ({ column }) => <DataTableHeader column={column} title="Computer" />,
    cell: ({ row }) => {
      const computer = row.original.computer;
      return <span>{computer.name}</span>;
    },
  },
  {
    accessorKey: 'services',
    header: ({ column }) => <DataTableHeader column={column} title="Services" />,
    cell: ({ row }) => {
      const services = row.original.services;
      const serviceCount = services.length || 0;

      return (
        <Badge variant="secondary">
          {serviceCount} {serviceCount === 1 ? 'service' : 'services'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'totalPrice',
    header: ({ column }) => <DataTableHeader column={column} title="Total Price" />,
    cell: ({ row }) => {
      const amount = row.getValue<number>('totalPrice');
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount || 0);

      return <span>{formatted}</span>;
    },
  },
  {
    accessorKey: 'startTimestamp',
    header: ({ column }) => <DataTableHeader column={column} title="Start Time" />,
    cell: ({ row }) => {
      const date = new Date(row.getValue<string>('startTimestamp'));
      const formattedDate = new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date);

      return <span>{formattedDate}</span>;
    },
  },
  {
    accessorKey: 'endTimestamp',
    header: ({ column }) => <DataTableHeader column={column} title="End Time" />,
    cell: ({ row }) => {
      const endTime = row.getValue<string>('endTimestamp');
      if (!endTime) return <Badge variant="outline">In progress</Badge>;

      const date = new Date(endTime);
      const formattedDate = new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date);

      return <span>{formattedDate}</span>;
    },
  },
  {
    accessorKey: 'maxEndTimestamp',
    header: ({ column }) => <DataTableHeader column={column} title="Max End Time" />,
    cell: ({ row }) => {
      const date = new Date(row.getValue<string>('maxEndTimestamp'));
      const formattedDate = new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
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
        timeStyle: 'short',
      }).format(date);

      return <span>{formattedDate}</span>;
    },
  },
] as const satisfies ColumnDef<Bill>[];

const filterRules: FilterRule<Bill>[] = [
  { field: 'id', type: 'text' },
  { field: 'user', type: 'select', async: true, ...getUserAsyncSelectOptions('firstName') },
  { field: 'computer', type: 'select', async: true, ...getComputerAsyncSelectOptions('name') },
  { field: 'totalPrice', type: 'number', range: true },
  { field: 'startTimestamp', type: 'datetime', range: true },
  { field: 'endTimestamp', type: 'datetime', range: true },
  { field: 'createTimestamp', type: 'datetime', range: true },
  { field: 'deleteTimestamp', type: 'datetime', range: true },
];

interface BillDataTableProps
  extends Omit<ComponentProps<typeof DataTable<Bill>>, 'columns' | 'getRowId'> {
  renderColumns?: (existingColumns: typeof billDataTableColumns) => ColumnDef<Bill>[];
}

export function BillDataTable({ renderColumns, filter, ...props }: BillDataTableProps) {
  return (
    <DataTable
      getRowId={(row) => row.id}
      columns={!renderColumns ? billDataTableColumns : renderColumns(billDataTableColumns)}
      filterRules={filterRules}
      filter={filter}
      {...props}
    />
  );
}
