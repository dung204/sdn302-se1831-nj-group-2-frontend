import { z } from 'zod';

import { createBranchSchema } from './create-branch.type';

export const updateBranchSchema = createBranchSchema.partial();

export type UpdateBranchSchema = z.infer<typeof updateBranchSchema>;
