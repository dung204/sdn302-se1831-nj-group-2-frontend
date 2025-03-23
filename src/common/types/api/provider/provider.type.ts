import type { BaseModel } from '@/common/types';

export interface Provider extends BaseModel {
  name: string;
  description: string;
}
