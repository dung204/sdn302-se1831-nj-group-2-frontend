import type { SuccessResponse } from '@/common/types';
import type { ChangePasswordSchema, LoginSchema } from '@/common/types/api/auth';
import type { LoginSuccessPayload } from '@/common/types/api/auth/login-success-payload.type';
import { HttpClient } from '@/lib/http/core.http';

class AuthHttpClient extends HttpClient {
  constructor() {
    super();
  }

  public login(payload: LoginSchema) {
    return this.post<SuccessResponse<LoginSuccessPayload>>('/auth/login', payload);
  }

  public refresh(refreshToken: string) {
    return this.post<SuccessResponse<LoginSuccessPayload>>('/auth/refresh-token', { refreshToken });
  }

  public logout() {
    return this.delete<void>('/auth/logout', { isPrivateRoute: true });
  }

  public changePassword(payload: ChangePasswordSchema) {
    return this.patch<void>('/auth/change-password', payload, {
      isPrivateRoute: true,
    });
  }
}

export const authHttpClient = new AuthHttpClient();
