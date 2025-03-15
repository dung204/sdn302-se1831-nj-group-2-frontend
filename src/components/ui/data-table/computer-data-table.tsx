import type { ColumnDef } from '@tanstack/react-table';
import { type ComponentProps } from 'react';

import type { Computer } from '@/common/types/api/computer';

import { DataTable, DataTableHeader } from './data-table';

const computerDataTableColumns = [
  {
    accessorKey: 'id',
    header: ({ column }) => <DataTableHeader column={column} title="ID" />,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableHeader column={column} title="Name" />,
  },
  {
    accessorKey: 'position.name', // Hiển thị tên vị trí
    header: ({ column }) => <DataTableHeader column={column} title="Position" />,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.getValue<string>('status');
      return <span>{status}</span>; // Hiển thị trạng thái
    },
  },
  {
    accessorKey: 'pricePerHour',
    header: ({ column }) => <DataTableHeader column={column} title="Price/Hour" />,
    cell: ({ row }) => {
      const price = row.getValue<number>('pricePerHour');
      return <span>${price.toFixed(2)}</span>; // Hiển thị giá/giờ với định dạng USD
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
    accessorKey: 'provider.name', // Hiển thị tên nhà cung cấp
    header: ({ column }) => <DataTableHeader column={column} title="Provider" />,
  },
  {
    accessorKey: 'peripherals',
    header: ({ column }) => <DataTableHeader column={column} title="Peripherals" />,
    cell: ({ row }) => {
      const peripherals = row.getValue<Array<{ id: string; status: string }>>('peripherals');
      if (!peripherals || peripherals.length === 0) {
        return <span>No peripherals</span>;
      }

      // Hiển thị trạng thái của từng peripheral dưới dạng danh sách
      const peripheralStatuses = peripherals.map((p) => p.status).join(', ');
      return <span>{peripheralStatuses}</span>;
    },
  },
  {
    accessorKey: 'createTimestamp',
    header: ({ column }) => <DataTableHeader column={column} title="Created At" />,
    cell: ({ row }) => {
      const timestamp = row.getValue<string>('createTimestamp');
      if (!timestamp) {
        return <span>N/A</span>; // If no timestamp is present
      }

      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return <span>Invalid date</span>; // If the timestamp cannot be converted to a valid date
      }

      const formattedDate = new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'long',
      }).format(date);

      return <span>{formattedDate}</span>; // Display the formatted date
    },
  },

  //   {
  //     accessorKey: 'createTimestamp',
  //     header: ({ column }) => <DataTableHeader column={column} title="Created At" />,
  //     cell: ({ row }) => {
  //       const date = new Date(row.getValue<string>('createTimestamp'));
  //       const formattedDate = new Intl.DateTimeFormat('en-US', {
  //         dateStyle: 'medium',
  //         timeStyle: 'long',
  //       }).format(date);

  //       return <span>{formattedDate}</span>; // Định dạng và hiển thị thời gian tạo
  //     },
  //   },
] as const satisfies ColumnDef<Computer>[];

// const filterRules: FilterRule<User>[] = [
//   { field: 'firstName', type: 'text' },
//   { field: 'lastName', type: 'text' },
//   {
//     field: 'role',
//     type: 'select',
//     options: Object.values(Role).map((role) => ({ value: role, label: role })),
//     multiple: true,
//   },
//   { field: 'address', type: 'text' },
//   { field: 'createTimestamp', type: 'datetime' },
// ];

interface ComputerDataTableProps
  extends Omit<ComponentProps<typeof DataTable<Computer>>, 'columns' | 'getRowId'> {
  renderColumns?: (existingColumns: typeof computerDataTableColumns) => ColumnDef<Computer>[];
}

export function ComputerDataTable({ renderColumns, filter, ...props }: ComputerDataTableProps) {
  return (
    <DataTable
      getRowId={(row) => row.id}
      columns={!renderColumns ? computerDataTableColumns : renderColumns(computerDataTableColumns)}
      //   filterRules={filterRules}
      filter={filter}
      {...props}
    />
  );
}
