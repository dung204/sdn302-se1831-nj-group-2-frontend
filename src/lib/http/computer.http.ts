import type { CommonSearchParams, SuccessResponse } from '@/common/types';
import type {
  Computer,
  CreateComputerSchema,
  UpdateComputerSchema,
} from '@/common/types/api/computer';
import { HttpClient } from '@/lib/http/core.http';

class ComputerHttpClient extends HttpClient {
  constructor() {
    super();
  }

  public getAllComputers(params?: CommonSearchParams) {
    return this.get<SuccessResponse<Computer[]>>('/computers', {
      params,
      isPrivateRoute: true,
    });
  }

  public getAllDeletedComputers(params?: CommonSearchParams) {
    return this.get<SuccessResponse<Computer[]>>('/computers/deleted', {
      params,
      isPrivateRoute: true,
    });
  }

  public getComputerById(id: string) {
    return this.get<SuccessResponse<Computer>>(`/computers/${id}`, {
      isPrivateRoute: true,
    });
  }

  public createNewComputer(payload: CreateComputerSchema) {
    return this.post<SuccessResponse<Computer>>('/computers', payload, {
      isPrivateRoute: true,
    });
  }

  public updateComputer(id: string) {
    return (payload: UpdateComputerSchema) =>
      this.patch<SuccessResponse<Computer>>(`/computers/${id}`, payload, {
        isPrivateRoute: true,
      });
  }

  public softDeleteComputer(id: string) {
    return this.delete(`/computers/${id}`, {
      isPrivateRoute: true,
    });
  }

  public restoreComputer(id: string) {
    return this.patch<SuccessResponse<Computer>>(
      `/computers/restore/${id}`,
      {},
      {
        isPrivateRoute: true,
      },
    );
  }
}

export const computerHttpClient = new ComputerHttpClient();
