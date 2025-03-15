import { useQuery } from '@tanstack/react-query';
import { Navigate, getRouteApi } from '@tanstack/react-router';

import { useAuth } from '@/common/hooks';
import { usageTrackingSearchParamsSchema } from '@/common/types/api/usage-tracking/usage-tracking-search-params.type';
import { Role } from '@/common/types/api/user';
import { UsageTracingDataTable } from '@/components/ui/data-table';
import { usageTrackingHttpClient } from '@/lib/http';

const route = getRouteApi('/_non-auth-layout/usage-tracking/deleted/');

export function ManageUsageTrackingDeletedPage() {
  const { user } = useAuth();
  const searchParams = usageTrackingSearchParamsSchema.parse(route.useSearch());
  const { data: res, isLoading } = useQuery({
    queryKey: ['deleted-usage-tracking', 'all', searchParams],
    queryFn: () => usageTrackingHttpClient.getAllDeletedUsageTrackings(searchParams),
  });

  // incorrect role
  if (user?.role === Role.GUEST) {
    return <Navigate to="/" />;
  }

  // correct role => return the page
  return (
    <>
      <UsageTracingDataTable
        data={res?.data ?? []}
        loading={isLoading}
        pagination={res?.meta.pagination}
        sorting={res?.meta.sorting}
      />
    </>
  );
}
