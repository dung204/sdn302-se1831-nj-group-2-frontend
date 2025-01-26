'use client';

import { useNavigate } from '@tanstack/react-router';
import {
  type Column,
  type PaginationOptions,
  type SortDirection,
  type SortingOptions,
  type TableOptions,
  type TableState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp } from 'lucide-react';
import type { ComponentProps } from 'react';

import type {
  Pagination as PaginationMetadata,
  Sorting as SortingMetadata,
} from '@/common/types';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { Pagination, PaginationSkeleton } from '@/components/ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/cn';

interface DataTableProps<TData>
  extends Omit<
    TableOptions<TData>,
    keyof PaginationOptions | keyof SortingOptions<TData> | 'getCoreRowModel'
  > {
  state?: Omit<Partial<TableState>, 'pagination' | 'sorting'>;
  loading?: boolean;
  pagination?: PaginationMetadata;
  sorting?: SortingMetadata[];
}

export function DataTable<TData>({
  state,
  loading,
  pagination,
  sorting = [],
  ...props
}: DataTableProps<TData>) {
  const table = useReactTable({
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
    rowCount: pagination?.total,
    pageCount: pagination?.pageSize,
    state: {
      pagination: {
        pageIndex: pagination ? pagination.page - 1 : 0,
        pageSize: pagination ? pagination.pageSize : 10,
      },
      sorting: sorting.map((sort) => ({
        id: sort.field,
        desc: sort.direction === 'desc',
      })),
      ...state,
    },
    ...props,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          {Object.keys(state?.rowSelection || {}).length !== 0 && (
            <p className="text-sm text-muted-foreground">
              {Object.keys(state?.rowSelection || {}).length} of{' '}
              {pagination?.total} item(s) selected.
            </p>
          )}
        </div>
        {pagination && (
          <div>
            <Pagination pagination={pagination} />
          </div>
        )}
        {loading && (
          <div>
            <PaginationSkeleton />
          </div>
        )}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {(() => {
              if (loading) {
                return (
                  <TableRow>
                    <TableCell
                      colSpan={table.getAllColumns().length}
                      className="h-24"
                    >
                      <div className="flex h-full items-center justify-center">
                        <LoadingIndicator className="size-12" />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              }

              if (table.getRowModel().rows?.length) {
                return table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    onClick={() => row.toggleSelected()}
                    className="cursor-pointer"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ));
              }

              return (
                <TableRow>
                  <TableCell
                    colSpan={table.getAllColumns().length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              );
            })()}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

interface DataTableHeaderProps<TData> extends ComponentProps<'div'> {
  column: Column<TData>;
  title?: string;
}

export function DataTableHeader<TData>({
  column,
  title,
  className,
  ...props
}: DataTableHeaderProps<TData>) {
  const navigate = useNavigate();
  const headerTitle = title ?? column.id;

  const handleSort = () => {
    const direction =
      !column.getIsSorted() || column.getIsSorted() === 'desc' ? 'asc' : 'desc';
    const url = new URL(location.href);

    navigate({
      to: url.pathname,
      search: { sorting: `${column.id}:${direction}` },
    });
  };

  return (
    <div
      className={cn('flex cursor-pointer select-none items-center', className)}
      {...props}
      onClick={handleSort}
      title={`Click to sort by ${headerTitle}`}
    >
      {headerTitle}
      <SortingIcon isSorted={column.getIsSorted()} className="ml-2 size-4" />
    </div>
  );
}

interface SortingIconProps extends ComponentProps<typeof ArrowUp> {
  isSorted: false | SortDirection;
}

function SortingIcon({ isSorted, className, ...props }: SortingIconProps) {
  if (!isSorted) {
    return null;
  }

  return isSorted === 'asc' ? (
    <ArrowUp className={cn('text-success', className)} {...props} />
  ) : (
    <ArrowDown className={cn('text-danger', className)} {...props} />
  );
}
