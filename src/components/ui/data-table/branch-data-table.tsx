import type { ColumnDef } from '@tanstack/react-table';
import { type ComponentProps } from 'react';

import type { Branch } from '@/common/types/api/branch';

import { DataTable, DataTableHeader, type FilterRule } from './data-table';

const branchDataTableColumns = [
  {
    accessorKey: 'id',
    header: ({ column }) => <DataTableHeader column={column} title="ID" />,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableHeader column={column} title="Name" />,
  },
  {
    accessorKey: 'address',
    header: 'Address',
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
] as const satisfies ColumnDef<Branch>[];

const filterRules: FilterRule<Branch>[] = [
  { field: 'name', type: 'text' },
  { field: 'createTimestamp', type: 'datetime', range: true },
  { field: 'deleteTimestamp', type: 'datetime', range: true },
];

interface BranchDataTableProps
  extends Omit<ComponentProps<typeof DataTable<Branch>>, 'columns' | 'getRowId'> {
  renderColumns?: (existingColumns: typeof branchDataTableColumns) => ColumnDef<Branch>[];
}

export function BranchDataTable({ renderColumns, filter, ...props }: BranchDataTableProps) {
  return (
    <DataTable
      getRowId={(row) => row.id}
      columns={!renderColumns ? branchDataTableColumns : renderColumns(branchDataTableColumns)}
      filterRules={filterRules}
      filter={filter}
      {...props}
    />
  );
}
