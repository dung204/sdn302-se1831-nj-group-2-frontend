import type { SuccessResponse } from '@/common/types';
import type { ChangePasswordSchema } from '@/common/types/api/auth';
import type {
  CreateUserSchema,
  UpdateUserSchema,
  User,
  UserSearchParams,
} from '@/common/types/api/user';

import { HttpClient } from './core.http';

class UserHttpClient extends HttpClient {
  constructor() {
    super();
  }

  public getCurrentUserProfile() {
    return this.get<SuccessResponse<User>>('/me/profile', {
      isPrivateRoute: true,
    });
  }

  public updateCurrentUserProfile(payload: UpdateUserSchema) {
    return this.patch<SuccessResponse<User>>('/me/profile', payload, {
      isPrivateRoute: true,
    });
  }

  public changePassword(payload: ChangePasswordSchema) {
    return this.patch<void>('/auth/change-password', payload, {
      isPrivateRoute: true,
    });
  }

  public getAllUsers(params?: UserSearchParams) {
    return this.get<SuccessResponse<User[]>>('/users', {
      params,
      isPrivateRoute: true,
    });
  }

  public getAllDeletedUsers(params?: UserSearchParams) {
    return this.get<SuccessResponse<User[]>>('/users/deleted', {
      params,
      isPrivateRoute: true,
    });
  }

  public getUserById(id: string) {
    return this.get<SuccessResponse<User>>(`/users/${id}`, {
      isPrivateRoute: true,
    });
  }

  public createNewUser(payload: CreateUserSchema) {
    return this.post<SuccessResponse<User>>('/users', payload, {
      isPrivateRoute: true,
    });
  }

  public updateUser(id: string) {
    return (payload: UpdateUserSchema) =>
      this.patch<SuccessResponse<User>>(`/users/${id}`, payload, {
        isPrivateRoute: true,
      });
  }

  public softDeleteUser(id: string) {
    return this.delete(`/users/${id}`, {
      isPrivateRoute: true,
    });
  }

  public restoreUser(id: string) {
    return this.patch<SuccessResponse<User>>(
      `/users/restore/${id}`,
      {},
      {
        isPrivateRoute: true,
      },
    );
  }

  public getDashboardStats() {
    return this.get<SuccessResponse<number>>('/users/dashboard/stats', {
      isPrivateRoute: true,
    });
  }
}

export const userHttpClient = new UserHttpClient();
