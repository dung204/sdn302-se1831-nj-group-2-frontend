import type { BaseModel } from '@/common/types';
import type { Branch } from '@/common/types/api/branch';

import type { PositionStatus } from './position-status.type';

export interface Position extends BaseModel {
  name: string;
  description: string;
  branch: Branch;
  status: PositionStatus;
}
