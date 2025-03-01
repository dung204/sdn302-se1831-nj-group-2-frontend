import { z } from 'zod';

export const changePasswordSchema = z.object({
  oldPassword: z.string(),
  newPassword: z.string(),
});

export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;
