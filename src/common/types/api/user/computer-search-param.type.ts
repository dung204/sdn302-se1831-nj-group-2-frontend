import { z } from 'zod';

import { commonSearchParamsSchema } from '@/common/types';
import { SortingUtils } from '@/common/utils';

export const computerSearchParamsSchema = commonSearchParamsSchema.extend({
  // Trường sorting hỗ trợ sắp xếp theo các thuộc tính của Computer
  sorting: SortingUtils.getSortingValueSchema([
    'id',
    'name',
    'status',
    'pricePerHour',
    'cpu',
    'ram',
    'storage',
  ]),

  name: z.string().optional(),
  position: z.string().optional(),
  status: z.enum(['NORMAL', 'BROKEN', 'MAINTENANCE']).optional(),
  pricePerHour: z.number().optional(),
  cpu: z.string().optional(),
  ram: z.string().optional(),
  storage: z.string().optional(),
  provider: z.string().optional(),
});

export type ComputerSearchParams = z.infer<typeof computerSearchParamsSchema>;
