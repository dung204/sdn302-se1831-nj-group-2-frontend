import type { BaseModel } from '@/common/types';
import type { Branch } from '@/common/types/api/branch';

import type { Role } from './role.type';

export type User = BaseModel & {
  username: string;
  firstName: string;
  lastName: string;
  address: string | null;
  citizenNumber: string | null;
  phoneNumber: string | null;
  availableTime: number | null;
  branch?: Branch;
  role: Role;
};
