import { z } from 'zod';

import { Role } from '@/common/types';

export const createUserSchema = z.object({
  firstName: z.string().nonempty('First name is required'),
  lastName: z.string().nonempty('Last name is required'),
  address: z.string().optional().nullable(),
  role: z.enum([Role.ADMIN, Role.USER]),
});

export type CreateUserSchema = z.infer<typeof createUserSchema>;
