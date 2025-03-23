import { z } from 'zod';

export const createBranchSchema = z.object({
  name: z.string().nonempty('Name is required'),
  address: z.string().nullable().optional(),
});

export type CreateBranchSchema = z.infer<typeof createBranchSchema>;
