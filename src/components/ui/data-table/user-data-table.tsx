import type { ColumnDef } from '@tanstack/react-table';
import { type ComponentProps } from 'react';

import { Role, type User } from '@/common/types/api/user';

import { DataTable, DataTableHeader, type FilterRule } from './data-table';

const userDataTableColumns = [
  {
    accessorKey: 'id',
    header: ({ column }) => <DataTableHeader column={column} title="ID" />,
  },
  {
    accessorKey: 'firstName',
    header: ({ column }) => <DataTableHeader column={column} title="First name" />,
  },
  {
    accessorKey: 'lastName',
    header: ({ column }) => <DataTableHeader column={column} title="Last name" />,
  },
  {
    accessorKey: 'address',
    header: 'Address',
  },
  {
    accessorKey: 'role',
    header: 'Role',
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
] as const satisfies ColumnDef<User>[];

const filterRules: FilterRule<User>[] = [
  { field: 'firstName', type: 'text' },
  { field: 'lastName', type: 'text' },
  {
    field: 'role',
    type: 'select',
    options: Object.values(Role).map((role) => ({ value: role, label: role })),
    multiple: true,
  },
  { field: 'address', type: 'text' },
  { field: 'createTimestamp', type: 'datetime', range: true },
];

interface UserDataTableProps
  extends Omit<ComponentProps<typeof DataTable<User>>, 'columns' | 'getRowId' | 'filterRules'> {
  renderColumns?: (existingColumns: typeof userDataTableColumns) => ColumnDef<User>[];
  filterRulesFn?: (existingFilterRules: typeof filterRules) => FilterRule<User>[];
}

export function UserDataTable({ renderColumns, filter, ...props }: UserDataTableProps) {
  return (
    <DataTable
      getRowId={(row) => row.id}
      columns={!renderColumns ? userDataTableColumns : renderColumns(userDataTableColumns)}
      filterRules={!props.filterRulesFn ? filterRules : props.filterRulesFn(filterRules)}
      filter={filter}
      {...props}
    />
  );
}
