import type { BaseModel } from '@/common/types';
import type { Provider } from '@/common/types/api/provider';

import type { PeripheralType } from './peripheral-type.enum';

export interface Peripheral extends BaseModel {
  name: string;
  brand: string;
  type: PeripheralType;
  provider: Provider;
  importPrice: number;
}
