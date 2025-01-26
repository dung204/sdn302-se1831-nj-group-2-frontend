import type { ColumnDef } from '@tanstack/react-table';
import { type ComponentProps } from 'react';

import type { User } from '@/common/types/api/user';
import { Checkbox } from '@/components/ui/checkbox';

import { DataTable, DataTableHeader } from './data-table';

const userDataTableColumns = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        title="Select all rows"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        title="Select this row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
  },
  {
    accessorKey: 'id',
    header: ({ column }) => <DataTableHeader column={column} title="ID" />,
  },
  {
    accessorKey: 'firstName',
    header: ({ column }) => (
      <DataTableHeader column={column} title="First name" />
    ),
  },
  {
    accessorKey: 'lastName',
    header: ({ column }) => (
      <DataTableHeader column={column} title="Last name" />
    ),
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
    header: ({ column }) => (
      <DataTableHeader column={column} title="Created At" />
    ),
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

interface UserDataTableProps
  extends Omit<ComponentProps<typeof DataTable<User>>, 'columns' | 'getRowId'> {
  renderColumns?: (
    existingColumns: typeof userDataTableColumns,
  ) => ColumnDef<User>[];
}

export function UserDataTable({ renderColumns, ...props }: UserDataTableProps) {
  return (
    <DataTable
      getRowId={(row) => row.id}
      columns={
        !renderColumns
          ? userDataTableColumns
          : renderColumns(userDataTableColumns)
      }
      {...props}
    />
  );
}
