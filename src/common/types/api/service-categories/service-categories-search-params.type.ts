import { z } from 'zod';

import { commonSearchParamsSchema } from '@/common/types';
import { SortingUtils } from '@/common/utils';

export const serviceCategoriesSearchParamsSchema = commonSearchParamsSchema.extend({
  sorting: SortingUtils.getSortingValueSchema(['id', 'name', 'createTimeStamp', 'deleteTimestamp']),
});

export type ServiceCategoriesSearchParams = z.infer<typeof serviceCategoriesSearchParamsSchema>;
