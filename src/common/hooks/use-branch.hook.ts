import { useContext } from 'react';

import { BranchContext } from '@/common/contexts';

export function useBranch() {
  const value = useContext(BranchContext);

  if (!value) {
    throw new Error('useBranch must be used within a BranchProvider');
  }

  return value;
}
