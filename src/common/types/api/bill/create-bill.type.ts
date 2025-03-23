import { z } from 'zod';

export const createBillSchema = z.object({
  // TODO: Add additional properties
});

export type CreateBillSchema = z.infer<typeof createBillSchema>;
