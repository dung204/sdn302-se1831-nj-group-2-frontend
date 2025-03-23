'use client';

import { useNavigate } from '@tanstack/react-router';
import {
  type Column,
  type PaginationOptions,
  type SortDirection,
  type SortingOptions,
  type TableOptions,
  type TableState,
  type Table as TanstackTable,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, FilterIcon, FilterXIcon } from 'lucide-react';
import { type ComponentProps, Fragment, useId, useMemo, useState } from 'react';

import type {
  Filter as FilterMetadata,
  Pagination as PaginationMetadata,
  Sorting as SortingMetadata,
} from '@/common/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CurrencyInput } from '@/components/ui/currency-input';
import { CurrencyRangeInput } from '@/components/ui/currency-range-input';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { DateTimeRangePicker } from '@/components/ui/date-time-range-picker';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { NumberInput } from '@/components/ui/number-input';
import { NumberRangeInput } from '@/components/ui/number-range-input';
import { Pagination, PaginationSkeleton } from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TagInput } from '@/components/ui/tag-input';
import { cn } from '@/lib/cn';

type FilterRuleSelectOption = { label: string; value: string };

export type FilterRule<TData> = { field: keyof TData } & (
  | { type: 'text' }
  | { type: 'datetime'; range?: boolean }
  | { type: 'number'; range?: boolean; currency?: boolean }
  | { type: 'select'; options: FilterRuleSelectOption[]; multiple?: boolean }
);

interface DataTableProps<TData>
  extends Omit<
    TableOptions<TData>,
    keyof PaginationOptions | keyof SortingOptions<TData> | 'getCoreRowModel'
  > {
  state?: Omit<Partial<TableState>, 'pagination' | 'sorting'>;
  loading?: boolean;
  pagination?: PaginationMetadata;
  sorting?: SortingMetadata[];
  filter?: FilterMetadata;
  filterRules?: FilterRule<TData>[];
}

export function DataTable<TData>({
  state,
  loading,
  pagination,
  sorting = [],
  filterRules = [],
  filter,
  ...props
}: DataTableProps<TData>) {
  const table = useReactTable({
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
    manualFiltering: true,
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

  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {filterRules.length > 0 && (
            <FilterDialog
              key={JSON.stringify(filter)}
              table={table}
              filterRules={filterRules}
              filter={filter}
              open={isFilterDialogOpen}
              onOpenChange={setIsFilterDialogOpen}
              onApplyFilter={() => setIsFilterDialogOpen(false)}
            />
          )}
          {Object.keys(state?.rowSelection || {}).length !== 0 && (
            <p className="text-sm text-muted-foreground">
              {Object.keys(state?.rowSelection || {}).length} of {pagination?.total} item(s)
              selected.
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
                        : flexRender(header.column.columnDef.header, header.getContext())}
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
                    <TableCell colSpan={table.getAllColumns().length} className="h-24">
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
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ));
              }

              return (
                <TableRow>
                  <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
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
    const direction = !column.getIsSorted() || column.getIsSorted() === 'desc' ? 'asc' : 'desc';
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

interface FilterDialogProps<TData> extends ComponentProps<typeof Dialog> {
  table: TanstackTable<TData>;
  filterRules: FilterRule<TData>[];
  filter?: FilterMetadata;
  onApplyFilter?: (filter: FilterMetadata) => void;
}

function FilterDialog<TData>({
  table,
  filter,
  filterRules,
  onApplyFilter,
  onOpenChange,
  ...props
}: FilterDialogProps<TData>) {
  const navigate = useNavigate();
  const [filterState, setFilterState] = useState<FilterMetadata>(() => filter ?? {});

  const id = useId();
  const headerTitles = useMemo(() => {
    return table
      .getHeaderGroups()
      .map((headerGroup) =>
        headerGroup.headers.map((header) => {
          const columnHeader = header.column.columnDef.header;
          let headerTitle: string;

          if (typeof columnHeader === 'function') {
            headerTitle = columnHeader(header.getContext()).props.title as string;
          } else {
            headerTitle = columnHeader ?? '';
          }

          return { field: header.id, title: headerTitle };
        }),
      )
      .flat();
  }, [table]);

  const countEnabledFilters = useMemo(() => {
    return new Set(Object.keys(filter ?? {}).map((key) => key.replaceAll(/^(from|to)/g, ''))).size;
  }, [filter]);

  const handleApplyFilter = () => {
    navigate({ to: location.pathname, search: { ...filterState } });
  };

  const handleRemoveFilter = () => {
    navigate({ to: location.pathname, search: {} });
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      setFilterState(filter ?? {});
    }

    onOpenChange?.(open);
  };

  return (
    <Dialog onOpenChange={handleDialogOpenChange} {...props}>
      <DialogTrigger asChild>
        <Button>
          <FilterIcon className="size-6" /> Filter
          {countEnabledFilters > 0 && (
            <Badge variant="danger" className="rounded-full">
              {countEnabledFilters}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Filter</DialogTitle>
          <DialogDescription>Filter the table by the following rules.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-12 items-center gap-4">
          {filterRules.map((rule) => {
            const headerTitle = headerTitles.find((header) => header.field === rule.field)?.title;
            let FilterComp: JSX.Element;
            const fieldId = `${id}-${rule.field as string}`;
            const field = rule.field as string;

            switch (rule.type) {
              case 'text':
                FilterComp = (
                  <Input
                    type="text"
                    id={fieldId}
                    value={filterState[field] ?? ''}
                    onChange={(e) => {
                      if (e.target.value === '') {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const { [field]: _, ...rest } = filterState;
                        setFilterState(rest);
                        return;
                      }

                      setFilterState((state) => ({
                        ...state,
                        [rule.field as string]: e.target.value,
                      }));
                    }}
                  />
                );
                break;
              case 'datetime' /**
               * In the case of a datetime range picker, filerState stores two fields: `from${field}` and `to${field}`
               * For example, if the field is `createdAt`, the filterState would look like:
               * { fromCreatedAt: '2021-01-01', toCreatedAt: '2021-01-31' }
               */: {
                if (!rule.range) {
                  FilterComp = (
                    <DateTimePicker
                      date={
                        !filterState[field] ? undefined : new Date(filterState[field] as string)
                      }
                      setDate={(date) => {
                        if (!date) {
                          // eslint-disable-next-line @typescript-eslint/no-unused-vars
                          const { [field]: _, ...rest } = filterState;
                          setFilterState(rest);
                          return;
                        }

                        setFilterState((state) => ({
                          ...state,
                          [rule.field as string]: date.toISOString(),
                        }));
                      }}
                    />
                  );
                  break;
                }

                const fromField = `from${field[0].toUpperCase()}${field.slice(1)}`;
                const toField = `to${field[0].toUpperCase()}${field.slice(1)}`;
                FilterComp = (
                  <DateTimeRangePicker
                    dateRange={{
                      from: !filterState[fromField]
                        ? undefined
                        : new Date(filterState[fromField] as string),
                      to: !filterState[toField]
                        ? undefined
                        : new Date(filterState[toField] as string),
                    }}
                    onDateRangeChange={(range) => {
                      let newFilterState = { ...filterState };

                      if (!range?.from) {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const { [fromField]: _, ...rest } = newFilterState;
                        newFilterState = { ...rest };
                      } else {
                        newFilterState = {
                          ...newFilterState,
                          [fromField]: range.from.toISOString(),
                        };
                      }

                      if (!range?.to) {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const { [toField]: _, ...rest } = newFilterState;
                        newFilterState = { ...rest };
                      } else {
                        newFilterState = { ...filterState, [toField]: range.to.toISOString() };
                      }

                      setFilterState(newFilterState);
                    }}
                  />
                );
                break;
              }
              case 'select':
                FilterComp = !rule.multiple ? (
                  <Select
                    defaultValue={filterState[field]?.[0] as string}
                    onValueChange={(value) => setFilterState({ ...filterState, [field]: [value] })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Select a ${field}...`} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {rule.options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                ) : (
                  <TagInput
                    placeholder={`Select ${field}s...`}
                    tags={rule.options}
                    selectedValues={filterState[field] as string[]}
                    onTagsChange={(tags) => {
                      if (tags.length === 0) {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const { [field]: _, ...rest } = filterState;
                        setFilterState(rest);
                        return;
                      }

                      setFilterState({ ...filterState, [field]: tags.map((tag) => tag.value) });
                    }}
                  />
                );
                break;
              case 'number':
                if (rule.currency && rule.range) {
                  const fromField = `from${field[0].toUpperCase()}${field.slice(1)}`;
                  const toField = `to${field[0].toUpperCase()}${field.slice(1)}`;

                  FilterComp = (
                    <CurrencyRangeInput
                      value={{
                        from: Number(filterState[fromField]),
                        to: Number(filterState[toField]),
                      }}
                      onChange={({ from, to }) => {
                        let newFilterState = { ...filterState };

                        if (from !== 0 && !from) {
                          // eslint-disable-next-line @typescript-eslint/no-unused-vars
                          const { [fromField]: _, ...rest } = newFilterState;
                          newFilterState = { ...rest };
                        } else {
                          newFilterState = { ...newFilterState, [fromField]: from.toString() };
                        }

                        if (to !== 0 && !to) {
                          // eslint-disable-next-line @typescript-eslint/no-unused-vars
                          const { [toField]: _, ...rest } = newFilterState;
                          newFilterState = { ...rest };
                        } else {
                          newFilterState = { ...filterState, [toField]: to.toString() };
                        }

                        setFilterState(newFilterState);
                      }}
                    />
                  );
                  break;
                }

                if (rule.range) {
                  const fromField = `from${field[0].toUpperCase()}${field.slice(1)}`;
                  const toField = `to${field[0].toUpperCase()}${field.slice(1)}`;

                  FilterComp = (
                    <NumberRangeInput
                      value={{
                        from: Number(filterState[fromField]),
                        to: Number(filterState[toField]),
                      }}
                      onChange={({ from, to }) => {
                        let newFilterState = { ...filterState };

                        if (from !== 0 && !from) {
                          // eslint-disable-next-line @typescript-eslint/no-unused-vars
                          const { [fromField]: _, ...rest } = newFilterState;
                          newFilterState = { ...rest };
                        } else {
                          newFilterState = { ...newFilterState, [fromField]: from.toString() };
                        }

                        if (to !== 0 && !to) {
                          // eslint-disable-next-line @typescript-eslint/no-unused-vars
                          const { [toField]: _, ...rest } = newFilterState;
                          newFilterState = { ...rest };
                        } else {
                          newFilterState = { ...filterState, [toField]: to.toString() };
                        }

                        setFilterState(newFilterState);
                      }}
                    />
                  );
                  break;
                }

                if (rule.currency) {
                  FilterComp = (
                    <CurrencyInput
                      value={Number(filterState[rule.field])}
                      onChange={(value) => {
                        if (value !== 0 && !value) {
                          // eslint-disable-next-line @typescript-eslint/no-unused-vars
                          const { [field]: _, ...rest } = filterState;
                          setFilterState(rest);
                          return;
                        }

                        setFilterState((state) => ({
                          ...state,
                          [rule.field as string]: value.toString(),
                        }));
                      }}
                    />
                  );
                  break;
                }

                FilterComp = (
                  <NumberInput
                    value={Number(filterState[rule.field])}
                    onChange={(value) => {
                      if (value !== 0 && !value) {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const { [field]: _, ...rest } = filterState;
                        setFilterState(rest);
                        return;
                      }

                      setFilterState((state) => ({
                        ...state,
                        [rule.field as string]: value.toString(),
                      }));
                    }}
                  />
                );
                break;
            }

            return (
              <Fragment key={fieldId}>
                <div className="col-span-3">
                  <Label htmlFor={fieldId}>{headerTitle}</Label>
                </div>
                <div className="col-span-9">{FilterComp}</div>
              </Fragment>
            );
          })}
        </div>
        <DialogFooter>
          {Object.keys(filter ?? {}).length > 0 && (
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                onApplyFilter?.({});
                handleRemoveFilter();
              }}
            >
              <FilterXIcon className="size-6" />
              Remove
            </Button>
          )}
          <Button
            type="button"
            onClick={() => {
              onApplyFilter?.(filterState);
              handleApplyFilter();
            }}
          >
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
