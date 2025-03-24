import { z } from 'zod';

import { commonSearchParamsSchema } from '@/common/types';
import { Role } from '@/common/types/api/user';
import { SortingUtils } from '@/common/utils';

export const userSearchParamsSchema = commonSearchParamsSchema.extend({
  sorting: SortingUtils.getSortingValueSchema([
    'id',
    'firstName',
    'lastName',
    'deleteTimestamp',
  ]).optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  citizenNumber: z.string().optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  role: z
    .union([z.nativeEnum(Role).transform((value) => value.split(',')), z.array(z.nativeEnum(Role))])
    .optional(),
  branch: z.string().optional(),
});

export type UserSearchParams = z.infer<typeof userSearchParamsSchema>;
