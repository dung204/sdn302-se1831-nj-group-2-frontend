import { z } from 'zod';

export const commonSearchParamsSchema = z.object({
  page: z.number().int().positive().default(1).catch(1),
  pageSize: z.number().int().positive().default(10).catch(10),
  fromCreateTimestamp: z.coerce.date().optional(),
  toCreateTimestamp: z.coerce.date().optional(),
  fromDeleteTimestamp: z.coerce.date().optional(),
  toDeleteTimestamp: z.coerce.date().optional(),
});

export type CommonSearchParams = z.infer<typeof commonSearchParamsSchema>;
