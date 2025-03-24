import { z } from 'zod';

import { createServiceCategoriesSchema } from './create-service-categories.type';

export const updateServiceCategoriesSchema = createServiceCategoriesSchema.partial();

export type UpdateServiceCategoriesSchema = z.infer<typeof updateServiceCategoriesSchema>;
