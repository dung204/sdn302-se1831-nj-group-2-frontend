import { useQuery } from '@tanstack/react-query';
import { getRouteApi, useNavigate } from '@tanstack/react-router';
import { ArrowRight, EyeIcon } from 'lucide-react';
import { useEffect } from 'react';

import { type Branch, branchSearchParamsSchema } from '@/common/types/api/branch';
import { Button } from '@/components/ui/button';
import { BranchDataTable } from '@/components/ui/data-table';
import { branchHttpClient } from '@/lib/http';

const route = getRouteApi('/_non-auth-layout/guests/branches/');

export function GuestHomePage() {
  const searchParams = branchSearchParamsSchema.parse(route.useSearch());
  const navigate = useNavigate();

  const { data: res, isLoading } = useQuery({
    queryKey: ['branches', 'guest', searchParams],
    queryFn: () => branchHttpClient.getAllBranches(searchParams),
  });

  useEffect(() => {
    document.title = 'Branches | Internet Cafe';
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Our Branches</h1>
        <p className="text-muted-foreground">Explore our Internet Cafe branches across the city</p>
      </div>

      <BranchDataTable
        loading={isLoading}
        data={res?.data ?? []}
        pagination={res?.meta.pagination}
        sorting={res?.meta.sorting}
        filter={res?.meta.filter}
        renderColumns={(existingColumns) => [
          {
            id: 'index',
            header: 'No.',
            cell: ({ row }) => {
              const pagination = res?.meta.pagination;
              const pageIndex = (pagination?.page ?? 1) - 1;
              const pageSize = pagination?.pageSize ?? 10;
              return <div>{pageIndex * pageSize + row.index + 1}</div>;
            },
            enableSorting: false,
          },
          ...existingColumns.filter(
            (col) => col.accessorKey === 'name' || col.accessorKey === 'address',
          ),
          {
            id: 'actions',
            header: '',
            cell: ({ row }) => {
              const branch: Branch = row.original;
              return (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate({ to: `/branches/${branch.id}` })}
                >
                  <EyeIcon className="mr-2 size-4" />
                  View Branch
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              );
            },
            enableSorting: false,
          },
        ]}
      />
    </div>
  );
}
