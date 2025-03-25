import { useQuery } from '@tanstack/react-query';
import { getRouteApi, useNavigate, useParams } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';

import { DeviceStatus } from '@/common/types';
import { computerSearchParamsSchema } from '@/common/types/api/computer';
import { Button } from '@/components/ui/button';
import { ComputerDataTableGuest } from '@/components/ui/data-table';
import { branchHttpClient, computerHttpClient } from '@/lib/http';

const route = getRouteApi('/_non-auth-layout/guests/branches/$branchId/computers/');

export function GuestBranchComputersPage() {
  const params = useParams({ from: '/_non-auth-layout/guests/branches/$branchId/computers/' });
  const { branchId } = params;
  const searchParams = computerSearchParamsSchema.parse(route.useSearch());
  const navigate = useNavigate();

  const { data: branchRes } = useQuery({
    queryKey: ['branch', branchId],
    queryFn: () => branchHttpClient.getBranchById(branchId),
  });

  const { data: res, isLoading } = useQuery({
    queryKey: ['computers', branchId, searchParams],
    queryFn: () =>
      computerHttpClient.getAllComputers({
        ...searchParams,
        branch: branchId,
      }),
  });

  useEffect(() => {
    const branchName = branchRes?.data?.name || 'Branch';
    document.title = `${branchName} Computers | Internet Cafe`;
  }, [branchRes?.data?.name]);

  return (
    <div className="flex flex-col gap-4">
      <div className="mb-4 flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: '/guests/branches' })}
          className="mr-4"
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to Branches
        </Button>

        <div>
          <h1 className="text-2xl font-bold">{branchRes?.data?.name || 'Branch'} Computers</h1>
          <p className="text-muted-foreground">Explore available computers at this branch</p>
        </div>
      </div>

      <ComputerDataTableGuest
        loading={isLoading}
        data={res?.data ?? []}
        pagination={res?.meta.pagination}
        sorting={res?.meta.sorting}
        filter={res?.meta.filter}
        renderColumns={(_existingColumns) => [
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
          {
            accessorKey: 'name',
            header: 'Computer Name',
          },
          {
            accessorKey: 'position',
            header: 'Position',
            cell: ({ row }) => {
              const position = row.original.position;
              return position?.name || 'N/A';
            },
          },
          {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
              const status = row.original.status;
              const getStatusClass = (status: DeviceStatus) => {
                switch (status) {
                  case DeviceStatus.NORMAL:
                    return 'text-green-600';
                  case DeviceStatus.MAINTENANCE:
                    return 'text-amber-600';
                  default:
                    return 'text-red-600';
                }
              };

              return (
                <div className={`capitalize ${getStatusClass(status)}`}>
                  {status?.toLowerCase().replace('_', ' ')}
                </div>
              );
            },
          },
          {
            accessorKey: 'pricePerHour',
            header: 'Price Per Hour',
            cell: ({ row }) => `$${row.original.pricePerHour.toFixed(2)}`,
          },
        ]}
      />
    </div>
  );
}
