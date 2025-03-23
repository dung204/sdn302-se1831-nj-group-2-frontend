import { z } from 'zod';

import { PositionStatus } from '@/common/types/api/position/position-status.type';
import { commonSearchParamsSchema } from '@/common/types/common-search-params.type';
import { SortingUtils } from '@/common/utils';

export const positionSearchParamsSchema = commonSearchParamsSchema.extend({
  sorting: SortingUtils.getSortingValueSchema([
    'id',
    'name',
    'status',
    'createTimestamp',
    'deleteTimestamp',
  ]),
  name: z.string().optional(),
  status: z
    .union([
      z.nativeEnum(PositionStatus).transform((value) => [value]),
      z.array(z.nativeEnum(PositionStatus)),
    ])
    .optional(),
  branch: z.string().optional(),
});

export type PositionSearchParams = z.infer<typeof positionSearchParamsSchema>;
