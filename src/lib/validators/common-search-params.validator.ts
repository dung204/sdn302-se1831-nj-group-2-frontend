import { z } from 'zod';

export const commonSearchParamsSchema = z.object({
  page: z.number().int().positive().default(1).catch(1),
  pageSize: z.number().int().positive().default(10).catch(10),
});

export type CommonSearchParams = z.infer<typeof commonSearchParamsSchema>;
