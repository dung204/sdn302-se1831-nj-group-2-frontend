import { z } from 'zod';

import { createServiceSchema } from './create-service.type';

export const updateServiceSchema = createServiceSchema.partial();

export type UpdateServiceSchema = z.infer<typeof updateServiceSchema>;
