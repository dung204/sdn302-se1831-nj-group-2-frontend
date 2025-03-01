import type { Role } from './role.type';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  address: string | null;
  role: Role;
  createTimestamp: string;
  deleteTimestamp?: string | null;
}
