import { z } from 'zod';

import { createUserSchema } from './create-user.validator';

export const updateUserSchema = createUserSchema.partial();

export type UpdateUserSchema = z.infer<typeof updateUserSchema>;
