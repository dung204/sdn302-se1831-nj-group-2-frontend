import { useQuery } from '@tanstack/react-query';
import { Navigate } from '@tanstack/react-router';
import { useEffect } from 'react';

import { useAuth } from '@/common/hooks';
import { Role } from '@/common/types/api/user';
import { ComputerDataTable } from '@/components/ui/data-table';
import { computerHttpClient } from '@/lib/http/computer.http';

export function ManageComputersPage() {
  const { user } = useAuth();
  const { data: res, isLoading } = useQuery({
    queryKey: ['users', 'all'],
    queryFn: () => computerHttpClient.getAllComputers(),
  });
  useEffect(() => {
    if (user?.role === Role.OWNER) {
      document.title = 'Existing users | Internet Cafe Management';
    }
  }, [user]);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== Role.OWNER) {
    return <Navigate to="/" />;
  }

  return (
    <ComputerDataTable
      loading={isLoading}
      data={res?.data ?? []}
      pagination={res?.meta.pagination}
      sorting={res?.meta.sorting}
    />
  );
}
