import { z } from 'zod';

import { commonSearchParamsSchema } from '@/common/types/common-search-params.type';
import { SortingUtils } from '@/common/utils';

export const branchSearchParamsSchema = commonSearchParamsSchema.extend({
  name: z.string().optional(),
  sorting: SortingUtils.getSortingValueSchema(['id', 'name', 'createTimestamp', 'deleteTimestamp']),
});

export type BranchSearchParams = z.infer<typeof branchSearchParamsSchema>;
