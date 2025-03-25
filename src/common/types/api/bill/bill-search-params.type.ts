import { z } from 'zod';

import { commonSearchParamsSchema } from '@/common/types/common-search-params.type';
import { SortingUtils } from '@/common/utils';

export const billSearchParamsSchema = commonSearchParamsSchema.extend({
  sorting: SortingUtils.getSortingValueSchema([
    'id',
    'computer',
    'services',
    'totalPrice',
    'startTimestamp',
    'endTimestamp',
    'maxEndTimestamp',
    'maxHoldingTimestamp',
    'createTimestamp',
    'deleteTimestamp',
  ]).optional(),
  user: z.string().optional(),
  computer: z.string().optional(),
  services: z.array(z.string()).optional(),
  totalPrice: z.number().optional(),
  maxEndTimestamp: z.coerce.date().optional(),
  maxHoldingTimestamp: z.coerce.date().optional(),
  startTimeStamp: z.coerce.date().optional(),
  endTimeStamp: z.coerce.date().optional(),
});

export type BillSearchParams = z.infer<typeof billSearchParamsSchema>;
