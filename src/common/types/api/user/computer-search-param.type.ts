import { z } from 'zod';

import { DeviceStatus, commonSearchParamsSchema } from '@/common/types';
import { SortingUtils } from '@/common/utils';

export const computerSearchParamsSchema = commonSearchParamsSchema.extend({
  sorting: SortingUtils.getSortingValueSchema([
    'id',
    'name',
    'status',
    'pricePerHour',
    'cpu',
    'ram',
    'storage',
  ]).optional(),
  name: z.string().optional(),
  position: z.string().optional(),
  status: z
    .union([
      z.nativeEnum(DeviceStatus).transform((value) => value.split(',')),
      z.array(z.nativeEnum(DeviceStatus)),
    ])
    .optional(),
  pricePerHour: z.number().optional(),
  cpu: z.string().optional(),
  ram: z.string().optional(),
  storage: z.string().optional(),
  provider: z.string().optional(),
});

export type ComputerSearchParams = z.infer<typeof computerSearchParamsSchema>;
