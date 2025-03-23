import type { BaseModel } from '@/common/types';
import type { Computer } from '@/common/types/api/computer';
import type { User } from '@/common/types/api/user';

export interface UsageTracking extends BaseModel {
  id: string;
  user: User;
  computer: Computer;
  startTimestamp: string;
  endTimestamp: string;
}
