import { z } from 'zod';

import { commonSearchParamsSchema } from '@/common/types';
import { SortingUtils } from '@/common/utils';

export const usageTrackingSearchParamsSchema = commonSearchParamsSchema.extend({
  sorting: SortingUtils.getSortingValueSchema([
    'id',
    'user',
    'computer',
    'startTimeStamp',
    'endTimeStamp',
    'createTimestamp',
    'deleteTimestamp',
  ]),
  user: z.string().optional(),
  computer: z.string().optional(),
  startTimeStamp: z.coerce.date().optional(),
  endTimeStamp: z.coerce.date().optional(),
});

export type UsageTrackingSearchParams = z.infer<typeof usageTrackingSearchParamsSchema>;
