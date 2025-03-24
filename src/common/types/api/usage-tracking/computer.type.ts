import type { DeviceStatus } from './device-status.type';
import type { Position } from './position.type';
import type { Provider } from './provider.type';

export type Computer = {
  id: string;
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
};
