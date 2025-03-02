import { z } from 'zod';

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().nonempty('Old password is required'),
    newPassword: z.string().nonempty('New password is required'),
    confirmNewPassword: z.string().nonempty('Confirm new password is required'),
  })
  .refine(({ newPassword, confirmNewPassword }) => newPassword === confirmNewPassword, {
    message: 'Confirm new password must match with new password',
    path: ['confirmNewPassword'],
  })
  .refine(({ oldPassword, newPassword }) => oldPassword !== newPassword, {
    message: 'New password must be different from the old password',
    path: ['newPassword'],
  });

export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;
