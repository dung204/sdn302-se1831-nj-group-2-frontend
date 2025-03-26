import { useQuery } from '@tanstack/react-query';
import { Navigate, getRouteApi } from '@tanstack/react-router';
import { useEffect } from 'react';

import { useAuth, useBranch } from '@/common/hooks';
import { computerSearchParamsSchema } from '@/common/types/api/computer';
import { Role } from '@/common/types/api/user';
import { ComputerDataTableGuest } from '@/components/ui/data-table';
import { computerHttpClient } from '@/lib/http';

const route = getRouteApi('/_non-auth-layout/guest/computers/');

export function GuestComputersPage() {
  const { branch } = useBranch();
  const { user } = useAuth();
  const searchParams = computerSearchParamsSchema.parse(route.useSearch());

  const { data: res, isLoading } = useQuery({
    queryKey: ['computers', branch?.id, searchParams],
    queryFn: () =>
      computerHttpClient.getAllComputers({
        ...searchParams,
        branch: branch?.id,
      }),
  });

  useEffect(() => {
    const branchName = branch?.name || 'Branch';
    document.title = `${branchName} Computers | Internet Cafe`;
  }, [branch?.name]);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== Role.GUEST) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">{branch?.name || 'Branch'} Computers</h1>
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
