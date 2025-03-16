import { z } from 'zod';

import { createPositionSchema } from './create-position.type';

export const updatePositionSchema = createPositionSchema.partial();

export type UpdatePositionSchema = z.infer<typeof updatePositionSchema>;
