import type { BaseModel } from '@/common/types';

export interface Branch extends BaseModel {
  name: string;
  address: string;
}
