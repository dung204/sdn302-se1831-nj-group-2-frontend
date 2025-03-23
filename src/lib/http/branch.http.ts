import type { SuccessResponse } from '@/common/types';
import type { Branch, CreateBranchSchema, UpdateBranchSchema } from '@/common/types/api/branch';
import { envVariables } from '@/common/utils';

import { HttpClient } from './core.http';

class BranchHttpClient extends HttpClient {
  constructor() {
    super(URL.parse('/branches', envVariables.API_ENDPOINT)!.href);
  }

  getAllBranch() {
    return this.get<SuccessResponse<Branch[]>>('/', {
      isPrivateRoute: true,
    });
  }

  getAllDeletedBranch() {
    return this.get<SuccessResponse<Branch[]>>('/deleted', {
      isPrivateRoute: true,
    });
  }

  getBranchById(id: string) {
    return this.get<SuccessResponse<Branch>>(`/${id}`, {
      isPrivateRoute: true,
    });
  }

  createNewBranch(payload: CreateBranchSchema) {
    return this.post<SuccessResponse<Branch>>('/', payload, {
      isPrivateRoute: true,
    });
  }

  updateBranch(id: string) {
    return (payload: UpdateBranchSchema) =>
      this.patch<SuccessResponse<Branch>>(`/${id}`, payload, {
        isPrivateRoute: true,
      });
  }

  softDeleteBranch(id: string) {
    return this.delete<void>(`/${id}`, {
      isPrivateRoute: true,
    });
  }

  restoreBranch(id: string) {
    return this.patch<void>(`/restore/${id}`, undefined, {
      isPrivateRoute: true,
    });
  }
}

export const branchHttpClient = new BranchHttpClient();
