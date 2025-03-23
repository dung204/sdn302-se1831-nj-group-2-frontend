import { z } from 'zod';

export const createProviderSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
});

export type CreateProviderSchema = z.infer<typeof createProviderSchema>;
