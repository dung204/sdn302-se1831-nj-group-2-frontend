import { z } from 'zod';

export const createServiceCategoriesSchema = z.object({
  name: z.string(),
  description: z.string(),
});

export type CreateServiceCategorieSchema = z.infer<typeof createServiceCategoriesSchema>;
