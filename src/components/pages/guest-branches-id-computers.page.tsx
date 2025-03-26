import { useQuery } from '@tanstack/react-query';
import { getRouteApi, useNavigate, useParams } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';

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
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate({ to: '/guests/branches' })}
        className="mb-4 mr-4 flex items-center"
      >
        <ArrowLeft className="mr-2 size-4" />
        Back to Branches
      </Button>

      <div>
        <h1 className="text-2xl font-bold">{branchRes?.data?.name || 'Branch'} Computers</h1>
        <p className="text-muted-foreground">Explore available computers at this branch</p>
      </div>

      <ComputerDataTableGuest
        loading={isLoading}
        data={res?.data ?? []}
        pagination={res?.meta.pagination}
        sorting={res?.meta.sorting}
        filter={res?.meta.filter}
      />
    </div>
  );
}
