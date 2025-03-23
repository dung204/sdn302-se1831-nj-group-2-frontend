import { z } from 'zod';

import { createBillSchema } from './create-bill.type';

export const updateBillSchema = createBillSchema.partial();

export type UpdateBillSchema = z.infer<typeof updateBillSchema>;
