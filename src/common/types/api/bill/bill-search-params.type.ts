import { z } from 'zod';

import { commonSearchParamsSchema } from '@/common/types/common-search-params.type';

export const billSearchParamsSchema = commonSearchParamsSchema.extend({
  // TODO: Add additional search params
});

export type BillSearchParams = z.infer<typeof billSearchParamsSchema>;
