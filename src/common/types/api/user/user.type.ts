import type { BaseModel } from '@/common/types';
import type { Branch } from '@/common/types/api/branch';

import type { Role } from './role.type';

export interface User extends BaseModel {
  username: string;
  firstName: string;
  lastName: string;
  address: string | null;
  role: Role;
  branch?: Branch;
  citizenNumber: string | null;
  phoneNumber: string | null;
  availableTime: number | null;
}
