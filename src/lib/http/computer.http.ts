import type { CommonSearchParams, SuccessResponse } from '@/common/types';
import type { Computer } from '@/common/types/api/usage-tracking';
import { HttpClient } from '@/lib/http/core.http';

class ComputerHttpClient extends HttpClient {
  constructor() {
    super();
  }

  public getAllComputer(params?: CommonSearchParams) {
    return this.get<SuccessResponse<Computer[]>>('/computers', {
      params,
      isPrivateRoute: true,
    });
  }
}

export const computerHttpClient = new ComputerHttpClient();
