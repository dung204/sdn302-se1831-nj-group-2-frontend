import { useQuery } from '@tanstack/react-query';
import { Navigate } from '@tanstack/react-router';

import { useAuth } from '@/common/hooks';
import { Role } from '@/common/types/api/user';
import { UsageTracingDataTable } from '@/components/ui/data-table';
import { usageTrackingHttpClient } from '@/lib/http';

export function ManageUsageTrackingPage() {
  const { user } = useAuth();
  const { data: res, isLoading } = useQuery({
    queryKey: ['usage-tracking', 'all'],
    queryFn: () => usageTrackingHttpClient.getAllUsageTrackings(),
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
