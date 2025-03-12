import type { Role } from './role.type';

export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  address: string | null;
  role: Role;
  citizenNumber: string | null;
  phoneNumber: string | null;
  availableTime: number | null;
  createTimestamp: string;
  deleteTimestamp?: string;
}
