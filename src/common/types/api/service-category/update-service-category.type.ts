import { z } from 'zod';

import { createServiceCategorySchema } from './create-service-category.type';

export const updateServiceCategorySchema = createServiceCategorySchema.partial();

export type UpdateServiceCategorySchema = z.infer<typeof updateServiceCategorySchema>;
