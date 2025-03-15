import { z } from 'zod';

import { DeviceStatus } from './device-status.type';

export const createComputerSchema = z.object({
  name: z.string().nonempty('Name is required'),
  position: z.string(),
  status: z.enum([DeviceStatus.NORMAL, DeviceStatus.ERROR, DeviceStatus.MAINTENANCE]),
  pricePerHour: z.number().min(0, 'Price per hour must be non-negative'),
  cpu: z.string().nonempty('CPU is required'),
  ram: z.string().nonempty('RAM is required'),
  storage: z.string().nonempty('Storage is required'),
  provider: z.string(),
  peripherals: z.array(z.object({ id: z.string(), status: z.string() })),
});

export type CreateComputerSchema = z.infer<typeof createComputerSchema>;
