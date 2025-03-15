import type { z } from 'zod';

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
});

export type UsageTrackingSearchParams = z.infer<typeof usageTrackingSearchParamsSchema>;
