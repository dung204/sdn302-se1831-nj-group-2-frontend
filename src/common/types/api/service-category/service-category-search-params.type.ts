import { z } from 'zod';

import { commonSearchParamsSchema } from '@/common/types/common-search-params.type';
import { SortingUtils } from '@/common/utils';

export const serviceCategorySearchParamsSchema = commonSearchParamsSchema.extend({
  sorting: SortingUtils.getSortingValueSchema([
    'id',
    'name',
    'createTimestamp',
    'deleteTimestamp',
  ]).optional(),
  name: z.string().optional(),
});

export type ServiceCategorySearchParams = z.infer<typeof serviceCategorySearchParamsSchema>;
