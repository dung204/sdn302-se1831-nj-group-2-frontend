import { z } from 'zod';

import { Role } from '@/common/types/api/user';

export const createUserSchema = z.object({
  username: z.string().nonempty('Username is required'),
  password: z.string().nonempty('Password is required'),
  firstName: z.string().nonempty('First name is required'),
  lastName: z.string().nonempty('Last name is required'),
  address: z.string().optional().nullable(),
  role: z.enum([Role.BRANCH_ADMIN, Role.GUEST, Role.OWNER, Role.STAFF]),
});

export type CreateUserSchema = z.infer<typeof createUserSchema>;
