import type { CommonSearchParams, SuccessResponse } from '@/common/types';
import type { CreateUserSchema, UpdateUserSchema, User } from '@/common/types/api/user';
import { HttpClient } from '@/lib/http/core.http';

class UserHttpClient extends HttpClient {
  constructor() {
    super();
  }

  public getAllUsers(params?: CommonSearchParams) {
    return this.get<SuccessResponse<User[]>>('/users', {
      params,
      isPrivateRoute: true,
    });
  }

  public getAllDeletedUsers(params?: CommonSearchParams) {
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
}

export const userHttpClient = new UserHttpClient();
