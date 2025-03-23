import type { BaseModel, DeviceStatus } from '@/common/types';
import type { Position } from '@/common/types/api/position';
import type { Provider } from '@/common/types/api/provider';

export interface Computer extends BaseModel {
  name: string;
  position: Position;
  status: DeviceStatus;
  pricePerHour: number;
  cpu: string;
  ram: string;
  storage: string;
  provider: Provider;
  peripherals: [
    {
      id: string;
      status: string;
    },
  ];
  createTimestamp: string;
}
