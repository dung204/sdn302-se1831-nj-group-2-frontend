import { z } from 'zod';

import { commonSearchParamsSchema } from '@/common/types/common-search-params.type';
import { SortingUtils } from '@/common/utils';

export const serviceSearchParamsSchema = commonSearchParamsSchema.extend({
  sorting: SortingUtils.getSortingValueSchema(['id', 'name', 'createTimestamp', 'deleteTimestamp']),
  name: z.string().optional(),
  category: z.string().optional(),
  fromPrice: z.string().optional(),
  toPrice: z.string().optional(),
  branch: z.string().optional(),
});

export type ServiceSearchParams = z.infer<typeof serviceSearchParamsSchema>;
