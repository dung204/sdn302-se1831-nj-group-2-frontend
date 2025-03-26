import { z } from 'zod';

import { ServiceStatus } from './bill.type';

export const createBillSchema = z.object({
  user: z.string().nonempty('User ID is required'),
  computer: z.string().nonempty('Computer ID is required'),
  services: z
    .array(
      z.object({
        _id: z.string().nonempty('Service ID is required'),
        quantity: z.number().default(1),
        status: z.nativeEnum(ServiceStatus).default(ServiceStatus.PENDING),
      }),
    )
    .optional()
    .default([]),
  startTimestamp: z.date().nullable().optional(),
  endTimestamp: z.date().nullable().optional(),
  maxEndTimestamp: z.date().nullable().optional(),
  maxHoldingTimestamp: z.date().nullable().optional(),
});

export type CreateBillSchema = z.infer<typeof createBillSchema>;
