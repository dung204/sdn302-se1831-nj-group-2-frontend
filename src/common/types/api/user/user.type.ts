import type { Role } from '@/common/types/role.type';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  address: string | null;
  role: Role;
  createTimestamp: string;
  deleteTimestamp?: string | null;
}
