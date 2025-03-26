import type { BaseModel } from '@/common/types';
import type { Computer } from '@/common/types/api/computer';
import type { Service } from '@/common/types/api/service';
import type { User } from '@/common/types/api/user';

 
export interface Bill extends BaseModel {
  // TODO: Add properties
  id: string;
  user: User;
  computer: Computer;
  services: Service[];
  startTimestamp: string;
  endTimestamp: string;
  maxEndTimestamp: string;
  maxHoldingTimestamp: string;
  totalPrice: number;
  createTimestamp: string;
}
