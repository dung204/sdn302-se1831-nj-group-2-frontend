import { z } from 'zod';

export const createServiceCategorySchema = z.object({
  name: z.string(),
  description: z.string(),
});

export type CreateServiceCategorySchema = z.infer<typeof createServiceCategorySchema>;
