import type { ColumnDef } from '@tanstack/react-table';
import type { ComponentProps } from 'react';

import type { ServiceCategories } from '@/common/types/api/service-categories';

import { DataTable, DataTableHeader } from './data-table';

const serviceCategoriesDataTableColumns = [
  {
    accessorKey: 'id',
    header: ({ column }) => <DataTableHeader column={column} title="ID" />,
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
  // Add more columns as needed...
] as const satisfies ColumnDef<ServiceCategories>[];
// const filterRules: FilterRule<ServiceCategories>[] = [
//   { field: 'name', type: 'text' },
//   { field: 'fromCreateTimestamp', type: 'datetime' },
//   { field: 'toCreateTimestamp', type: 'datetime' },
// ];
interface ServiceCategoriesDataTableProps
  extends Omit<ComponentProps<typeof DataTable<ServiceCategories>>, 'columns' | 'getRowId'> {
  renderColumns?: (
    existingColumns: typeof serviceCategoriesDataTableColumns,
  ) => ColumnDef<ServiceCategories>[];
}
export function ServiceCategoriesDataTable({
  renderColumns,
  filter,
  ...props
}: ServiceCategoriesDataTableProps) {
  return (
    <DataTable
      getRowId={(row) => row.id}
      columns={
        !renderColumns
          ? serviceCategoriesDataTableColumns
          : renderColumns(serviceCategoriesDataTableColumns)
      }
      // filterRules={filterRules}
      filter={filter}
      {...props}
    />
  );
}
