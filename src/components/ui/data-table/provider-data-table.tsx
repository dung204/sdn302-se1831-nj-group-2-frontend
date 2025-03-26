import type { ColumnDef } from '@tanstack/react-table';
import type { ComponentProps } from 'react';

import type { Provider } from '@/common/types/api/provider';
import { DataTable, DataTableHeader, type FilterRule } from '@/components/ui/data-table';

const providerDataTableColumns = [
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
] as const satisfies ColumnDef<Provider>[];

const filterRules: FilterRule<Provider>[] = [
  { field: 'name', type: 'text' },
  { field: 'createTimestamp', type: 'datetime', range: true },
  { field: 'deleteTimestamp', type: 'datetime', range: true },
];

interface ProviderDataTableProps
  extends Omit<ComponentProps<typeof DataTable<Provider>>, 'columns' | 'getRowId'> {
  renderColumns?: (existingColumns: typeof providerDataTableColumns) => ColumnDef<Provider>[];
}

export function ProviderDataTable({
  renderColumns,
  filter,
  data,
  ...props
}: ProviderDataTableProps) {
  return (
    <DataTable
      getRowId={(row) => row.id}
      columns={renderColumns ? renderColumns(providerDataTableColumns) : providerDataTableColumns}
      filterRules={filterRules}
      filter={filter}
      data={data}
      {...props}
    />
  );
}
