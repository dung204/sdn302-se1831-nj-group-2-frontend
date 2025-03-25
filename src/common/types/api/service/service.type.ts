import type { BaseModel } from '@/common/types';
import type { Branch } from '@/common/types/api/branch';
import type { ServiceCategory } from '@/common/types/api/service-category';

export interface Service extends BaseModel {
  name: string;
  description: string;
  price: number;
  category: ServiceCategory;
  branches: Branch[];
}
