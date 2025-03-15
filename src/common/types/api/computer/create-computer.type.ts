import { z } from 'zod';

import { DeviceStatus } from './device-status.type';

// Định nghĩa schema cho Position
const positionSchema = z.object({
  id: z.string(),
  name: z.string(),
  branch: z.string(),
  status: z.enum(['AVAILABLE', 'IN_USE']),
  createTimestamp: z.string(),
  deleteTimestamp: z.string().optional(),
});

// Định nghĩa schema cho Provider
const providerSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  createTimestamp: z.string(),
  deleteTimestamp: z.string().optional(),
});

// Định nghĩa schema cho Peripheral
const peripheralSchema = z.object({
  id: z.string(),
  status: z.string(),
});

// Định nghĩa schema cho Computer
export const createComputerSchema = z.object({
  _id: z.string(),
  name: z.string(),
  position: positionSchema,
  status: z.enum([DeviceStatus.NORMAL, DeviceStatus.MAINTENANCE, DeviceStatus.ERROR]),
  pricePerHour: z.number(),
  cpu: z.string(),
  ram: z.string(),
  storage: z.string(),
  provider: providerSchema,
  peripherals: z.array(peripheralSchema),
});

export type CreateComputerSchema = z.infer<typeof createComputerSchema>;
