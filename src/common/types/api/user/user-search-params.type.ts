import { z } from 'zod';

import { commonSearchParamsSchema } from '@/common/types';
import { SortingUtils } from '@/common/utils';

export const userSearchParamsSchema = commonSearchParamsSchema.extend({
  sorting: SortingUtils.getSortingValueSchema([
    'id',
    'firstName',
    'lastName',
    'deleteTimestamp',
  ]),
});

export type UserSearchParams = z.infer<typeof userSearchParamsSchema>;
