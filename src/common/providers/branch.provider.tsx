import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { type PropsWithChildren, useEffect, useState } from 'react';

import { BranchContext } from '@/common/contexts';
import { useAuth } from '@/common/hooks';
import { localStorageService } from '@/common/services';
import { LocalStorageKey } from '@/common/types';
import type { Branch } from '@/common/types/api/branch';
import { Role } from '@/common/types/api/user';
import { branchHttpClient } from '@/lib/http';

export function BranchProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [branch, setBranch] = useState<Branch | null>(null);
  const [branchId, setBranchId] = useState<string>(() => localStorageService.get('branchId', ''));

  const { data: res, isLoading } = useQuery({
    queryKey: ['branches', 'single', { branchId }],
    queryFn: () => branchHttpClient.getBranchById(branchId),
    enabled: branchId !== '',
  });

  useEffect(() => {
    if (!isLoading && res) {
      setBranch(res.data);
      if (res.data) {
        localStorageService.set(LocalStorageKey.BRANCH_ID, res.data.id);
        navigate({ to: '/' });
      }
    }
  }, [res, isLoading]);

  useEffect(() => {
    if (user?.role === Role.GUEST && !branch) {
      navigate({ to: '/guest/branches' });
      return;
    }
  }, [branch, navigate, user]);

  return (
    <BranchContext.Provider value={{ branch, setBranch, setBranchId }}>
      {children}
    </BranchContext.Provider>
  );
}
