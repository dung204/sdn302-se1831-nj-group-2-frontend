import { z } from 'zod';

export const createServiceSchema = z.object({
  name: z.string(),
  description: z.string(),
  price: z.coerce.number().positive(),
  category: z.string(),
  branches: z
    .union([z.string().transform((value) => value.split(',')), z.array(z.string())])
    .transform((value) => [...new Set(value)])
    .optional()
    .default([]),
});

export type CreateServiceSchema = z.infer<typeof createServiceSchema>;
