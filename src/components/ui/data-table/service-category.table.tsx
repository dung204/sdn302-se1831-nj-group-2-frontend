import type { ColumnDef } from '@tanstack/react-table';
import type { ComponentProps } from 'react';

import type { ServiceCategory } from '@/common/types/api/service-category';
import { DataTable, DataTableHeader, type FilterRule } from '@/components/ui/data-table';

const serviceCategoryDataTableColumns = [
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
    accessorKey: 'createTimestamp',
    header: ({ column }) => <DataTableHeader column={column} title="Created At" />,
    cell: ({ row }) => {
      const date = new Date(row.getValue<string>('createTimestamp'));
      const formattedDate = new Intl.DateTimeFormat('en-US', {
        dateStyle: 'long',
        timeStyle: 'long',
      }).format(date);

      return <span>{formattedDate}</span>;
    },
  },
  // Add more columns as needed...
] as const satisfies ColumnDef<ServiceCategory>[];
const filterRules: FilterRule<ServiceCategory>[] = [
  { field: 'name', type: 'text' },
  { field: 'createTimestamp', type: 'datetime', range: true },
];
interface ServiceCategoriesDataTableProps
  extends Omit<ComponentProps<typeof DataTable<ServiceCategory>>, 'columns' | 'getRowId'> {
  renderColumns?: (
    existingColumns: typeof serviceCategoryDataTableColumns,
  ) => ColumnDef<ServiceCategory>[];
}
export function ServiceCategoryDataTable({
  renderColumns,
  filter,
  ...props
}: ServiceCategoriesDataTableProps) {
  return (
    <DataTable
      getRowId={(row) => row.id}
      columns={
        !renderColumns
          ? serviceCategoryDataTableColumns
          : renderColumns(serviceCategoryDataTableColumns)
      }
      filterRules={filterRules}
      filter={filter}
      {...props}
    />
  );
}
