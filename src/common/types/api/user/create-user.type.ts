import { z } from 'zod';

import { Role } from '@/common/types/api/user';

export const baseCreateUserSchema = z.object({
  username: z.string().nonempty('Username is required'),
  password: z.string().nonempty('Password is required'),
  firstName: z.string().nonempty('First name is required'),
  lastName: z.string().nonempty('Last name is required'),
  address: z.string().optional().nullable(),
  role: z.nativeEnum(Role),
  branch: z.string().optional(),
});

export const createUserSchema = baseCreateUserSchema.refine(
  ({ role, branch }) =>
    ([Role.OWNER, Role.GUEST].includes(role) && !branch) ||
    ([Role.BRANCH_ADMIN, Role.STAFF].includes(role) && branch),
  ({ role }) => ({
    message: `Branch is required for role '${role}'`,
    path: ['branch'],
  }),
);

export type CreateUserSchema = z.infer<typeof createUserSchema>;
