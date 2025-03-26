import { createContext } from 'react';

import type { Branch } from '@/common/types/api/branch';

interface BranchContextValue {
  branch: Branch | null;
  setBranch: (branch: Branch | null) => void;
  setBranchId: (branchId: string) => void;
}

export const BranchContext = createContext<BranchContextValue | null>(null);
