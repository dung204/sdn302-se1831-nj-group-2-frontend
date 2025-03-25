import type { ColumnDef } from '@tanstack/react-table';
import { type ComponentProps } from 'react';

import { type Peripheral, PeripheralType } from '@/common/types/api/peripheral';
import type { Provider } from '@/common/types/api/provider';
import { getProviderAsyncSelectOptions } from '@/components/ui/async-select';

import { DataTable, DataTableHeader, type FilterRule } from './data-table';

const peripheralDataTableColumns = [
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
    accessorKey: 'type',
    header: 'Type',
  },
  {
    accessorKey: 'brand',
    header: ({ column }) => <DataTableHeader column={column} title="Brand" />,
  },
  {
    accessorKey: 'provider',
    header: 'Provider',
    cell: ({ row }) => {
      const provider = row.getValue<Provider>('provider');
      return <span>{provider.name}</span>;
    },
  },
  {
    accessorKey: 'importPrice',
    header: ({ column }) => <DataTableHeader column={column} title="Import Price" />,
    cell: ({ row }) => {
      const price = row.getValue<number>('importPrice');
      return (
        <span>
          {new Intl.NumberFormat(navigator.language, {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 20,
            maximumSignificantDigits: 20,
          }).format(price)}
        </span>
      );
    },
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
] as const satisfies ColumnDef<Peripheral>[];

const filterRules: FilterRule<Peripheral>[] = [
  { field: 'name', type: 'text' },
  {
    field: 'type',
    type: 'select',
    options: Object.values(PeripheralType).map((role) => ({ value: role, label: role })),
  },
  { field: 'brand', type: 'text' },
  { field: 'provider', type: 'select', async: true, ...getProviderAsyncSelectOptions('name') },
  { field: 'createTimestamp', type: 'datetime', range: true },
  { field: 'deleteTimestamp', type: 'datetime', range: true },
];

interface PeripheralDataTableProps
  extends Omit<ComponentProps<typeof DataTable<Peripheral>>, 'columns' | 'getRowId'> {
  renderColumns?: (existingColumns: typeof peripheralDataTableColumns) => ColumnDef<Peripheral>[];
}

export function PeripheralDataTable({ renderColumns, filter, ...props }: PeripheralDataTableProps) {
  return (
    <DataTable
      getRowId={(row) => row.id}
      columns={
        !renderColumns ? peripheralDataTableColumns : renderColumns(peripheralDataTableColumns)
      }
      filterRules={filterRules}
      filter={filter}
      {...props}
    />
  );
}
