import { z } from 'zod';

import { commonSearchParamsSchema } from '@/common/types/common-search-params.type';
import { SortingUtils } from '@/common/utils';

export const providerSearchParamsSchema = commonSearchParamsSchema.extend({
  sorting: SortingUtils.getSortingValueSchema(['id', 'name', 'createTimestamp', 'deleteTimestamp']),
  name: z.string().optional(),
});

export type ProviderSearchParams = z.infer<typeof providerSearchParamsSchema>;
