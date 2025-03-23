import { z } from 'zod';

import { PositionStatus } from '@/common/types/api/position/position-status.type';

export const createPositionSchema = z.object({
  name: z.string(),
  branch: z.string(),
  status: z.nativeEnum(PositionStatus).optional(),
});

export type CreatePositionSchema = z.infer<typeof createPositionSchema>;
