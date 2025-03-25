import { z } from 'zod';

import { DeviceStatus } from '@/common/types';

export const createComputerSchema = z.object({
  name: z.string().nonempty('Name is required'),
  position: z.string().nonempty('A position must be selected'),
  status: z.nativeEnum(DeviceStatus),
  pricePerHour: z.coerce.number().positive('Price per hour must be a positive number'),
  cpu: z.string().nonempty('CPU is required'),
  ram: z.string().nonempty('RAM is required'),
  storage: z.string().nonempty('Storage is required'),
  provider: z.string().nonempty('A provider must be selected'),
  peripherals: z
    .union([z.string().transform((value) => value.split(',')), z.array(z.string())])
    .optional()
    .default([]),
});

export type CreateComputerSchema = z.infer<typeof createComputerSchema>;
