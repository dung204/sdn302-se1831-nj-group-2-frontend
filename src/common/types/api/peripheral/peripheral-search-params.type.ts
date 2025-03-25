import { z } from 'zod';

import { commonSearchParamsSchema } from '@/common/types/common-search-params.type';
import { SortingUtils } from '@/common/utils';

export const peripheralSearchParamsSchema = commonSearchParamsSchema.extend({
  name: z.string().optional(),
  brand: z.string().optional(),
  provider: z.string().optional(),
  type: z
    .union([z.string().transform((value) => value.split(',')), z.array(z.string())])
    .optional(),
  sorting: SortingUtils.getSortingValueSchema([
    'id',
    'name',
    'brand',
    'importPrice',
    'provider',
    'createTimestamp',
    'deleteTimestamp',
  ]).optional(),
});

export type PeripheralSearchParams = z.infer<typeof peripheralSearchParamsSchema>;
