import type { ColumnDef } from '@tanstack/react-table';
import type { ComponentProps } from 'react';

import type { Service } from '@/common/types/api/service';
import { getServiceCategoryAsyncSelectOptions } from '@/components/ui/async-select/service-categories-select-options';
// Assuming this is where Service is defined
import { DataTable, DataTableHeader, type FilterRule } from '@/components/ui/data-table';

const serviceDataTableColumns = [
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
    accessorKey: 'description',
    header: ({ column }) => <DataTableHeader column={column} title="Description" />,
  },
  {
    accessorKey: 'price',
    header: ({ column }) => <DataTableHeader column={column} title="Price" />,
    cell: ({ row }) => {
      const price = row.getValue<number>('price');
      return <span>${price.toFixed(2)}</span>;
    },
  },
  {
    accessorKey: 'category',
    header: ({ column }) => <DataTableHeader column={column} title="Category" />,
    cell: ({ row }) => {
      const category = row.getValue<Service['category']>('category');
      return <span>{category.name}</span>;
    },
  },
  {
    accessorKey: 'createTimestamp',
    header: ({ column }) => <DataTableHeader column={column} title="Created At" />,
    cell: ({ row }) => {
      const date = new Date(row.getValue<string>('createTimestamp'));
      const formattedDate = new Intl.DateTimeFormat('en-US', {
        dateStyle: 'long',
        timeStyle: 'medium',
      }).format(date);

      return <span>{formattedDate}</span>;
    },
  },
  // Add more columns as needed...
] as const satisfies ColumnDef<Service>[];

const filterRules: FilterRule<Service>[] = [
  { field: 'name', type: 'text' },
  {
    field: 'category',
    type: 'select',
    async: true,
    ...getServiceCategoryAsyncSelectOptions('name'),
  },
  { field: 'price', type: 'number', range: true, currency: true },
  { field: 'createTimestamp', type: 'datetime', range: true },
  { field: 'deleteTimestamp', type: 'datetime', range: true },
];

interface ServiceDataTableProps
  extends Omit<ComponentProps<typeof DataTable<Service>>, 'columns' | 'getRowId'> {
  renderColumns?: (existingColumns: typeof serviceDataTableColumns) => ColumnDef<Service>[];
}

export function ServiceDataTable({ renderColumns, filter, ...props }: ServiceDataTableProps) {
  return (
    <DataTable
      getRowId={(row) => row.id}
      columns={!renderColumns ? serviceDataTableColumns : renderColumns(serviceDataTableColumns)}
      filterRules={filterRules}
      filter={filter}
      {...props}
    />
  );
}
