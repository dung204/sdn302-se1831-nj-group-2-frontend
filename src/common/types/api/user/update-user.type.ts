import { z } from 'zod';

import { Role } from '@/common/types/api/user';

import { baseCreateUserSchema } from './create-user.type';

export const baseUpdateUserSchema = baseCreateUserSchema.omit({ password: true }).partial();

export const updateUserSchema = baseUpdateUserSchema.refine(
  ({ role, branch }) =>
    !role ||
    ([Role.OWNER, Role.GUEST].includes(role) && !branch) ||
    ([Role.BRANCH_ADMIN, Role.STAFF].includes(role) && branch),
  ({ role }) => ({
    message: `Branch is required for role '${role}'`,
    path: ['branch'],
  }),
);

export type UpdateUserSchema = z.infer<typeof updateUserSchema>;
