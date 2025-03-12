import type { Role } from '@/common/types/api/user';

export type LoginSuccessPayload = {
  id: string;
  role: Role;
  accessToken: string;
  refreshToken: string;
};
