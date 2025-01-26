import type { SuccessResponse } from '@/common/types';
import type { User } from '@/common/types/api/user';
import { HttpClient } from '@/lib/http/core.http';
import type { CreateUserSchema, UpdateUserSchema } from '@/lib/validators';
import type { CommonSearchParams } from '@/lib/validators/common-search-params.validator';

class UserHttpClient extends HttpClient {
  constructor() {
    super();
  }

  public getAllUsers(params?: CommonSearchParams) {
    return this.get<SuccessResponse<User[]>>('/users', {
      params,
    });
  }

  public getAllDeletedUsers(params?: CommonSearchParams) {
    return this.get<SuccessResponse<User[]>>('/users/deleted', {
      params,
    });
  }

  public getUserById(id: string) {
    return this.get<SuccessResponse<User>>(`/users/${id}`);
  }

  public createNewUser(payload: CreateUserSchema) {
    return this.post<SuccessResponse<User>>('/users', payload);
  }

  public updateUser(id: string) {
    return (payload: UpdateUserSchema) =>
      this.patch<SuccessResponse<User>>(`/users/${id}`, payload);
  }

  public softDeleteUser(id: string) {
    return this.delete(`/users/${id}`);
  }

  public restoreUser(id: string) {
    return this.patch<SuccessResponse<User>>(`/users/restore/${id}`);
  }
}

export const userHttpClient = new UserHttpClient();
