import { z } from 'zod';

import { commonSearchParamsSchema } from '@/common/types';
import { SortingUtils } from '@/common/utils';

export const usageTrackingSearchParamsSchema = commonSearchParamsSchema.extend({
  sorting: SortingUtils.getSortingValueSchema([
    'id',
    'user',
    'computer',
    'startTimestamp',
    'endTimestamp',
  ]),
  user: z.string().optional(),
  computer: z.string().optional(),
  startTimestamp: z.string().optional(),
  endTimestamp: z.string().optional(),
});

export type UsageTrackingSearchParams = z.infer<typeof usageTrackingSearchParamsSchema>;
