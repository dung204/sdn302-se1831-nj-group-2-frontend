import { z } from 'zod';

import { commonSearchParamsSchema } from '@/common/types/common-search-params.type';
import { DeviceStatus } from '@/common/types/device-status.type';
import { SortingUtils } from '@/common/utils';

export const computerSearchParamsSchema = commonSearchParamsSchema.extend({
  sorting: SortingUtils.getSortingValueSchema([
    'id',
    'name',
    'status',
    'createTimestamp',
    'deleteTimestamp',
  ]).optional(),
  name: z.string().optional(),
  position: z.string().optional(),
  status: z
    .union([
      z.nativeEnum(DeviceStatus).transform((value) => value.split(',')),
      z.array(z.nativeEnum(DeviceStatus)),
    ])
    .optional(),
  provider: z.string().optional(),
  fromPricePerHour: z.number().optional(),
  toPricePerHour: z.number().optional(),
});

export type ComputerSearchParams = z.infer<typeof computerSearchParamsSchema>;
