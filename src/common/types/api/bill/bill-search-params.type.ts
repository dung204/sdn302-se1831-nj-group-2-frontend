import { z } from 'zod';

import { commonSearchParamsSchema } from '@/common/types/common-search-params.type';
import { SortingUtils } from '@/common/utils';

export const billSearchParamsSchema = commonSearchParamsSchema.extend({
  user: z.string().optional(),
  computerId: z.string().optional(),
  startDateFrom: z.string().optional(),
  startDateTo: z.string().optional(),
  endDateFrom: z.string().optional(),
  endDateTo: z.string().optional(),
  sorting: SortingUtils.getSortingValueSchema([
    'id',
    'user',
    'startTimestamp',
    'endTimestamp',
    'totalPrice',
    'createTimestamp',
    'deleteTimestamp',
  ]),
});

export type BillSearchParams = z.infer<typeof billSearchParamsSchema>;
