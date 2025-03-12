import { z } from 'zod';

import { commonSearchParamsSchema } from '@/common/types';
import { Role } from '@/common/types/api/user';
import { SortingUtils } from '@/common/utils';

export const userSearchParamsSchema = commonSearchParamsSchema.extend({
  sorting: SortingUtils.getSortingValueSchema(['id', 'firstName', 'lastName', 'deleteTimestamp']),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  citizenNumber: z.string().optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  role: z
    .union([
      z
        .enum([Role.OWNER, Role.BRANCH_ADMIN, Role.STAFF, Role.GUEST])
        .transform((value) => value.split(',')),
      z.array(z.enum([Role.OWNER, Role.BRANCH_ADMIN, Role.STAFF, Role.GUEST])),
    ])
    .optional(),
  branch: z.string().optional(),
});

export type UserSearchParams = z.infer<typeof userSearchParamsSchema>;
