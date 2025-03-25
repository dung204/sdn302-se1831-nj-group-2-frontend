import type { SuccessResponse } from '@/common/types';
import type {
  Computer,
  ComputerSearchParams,
  CreateComputerSchema,
  UpdateComputerSchema,
} from '@/common/types/api/computer';
import { envVariables } from '@/common/utils';
import { HttpClient } from '@/lib/http/core.http';

class ComputerHttpClient extends HttpClient {
  constructor() {
    super(`${envVariables.API_ENDPOINT}/computers`);
  }

  getAllComputers(params?: ComputerSearchParams) {
    return this.get<SuccessResponse<Computer[]>>('/', {
      isPrivateRoute: true,
      params,
    });
  }

  getAllDeletedComputers(params?: ComputerSearchParams) {
    return this.get<SuccessResponse<Computer[]>>('/deleted', {
      isPrivateRoute: true,
      params,
    });
  }

  public getComputerById(id: string) {
    return this.get<SuccessResponse<Computer>>(`/${id}`, {
      isPrivateRoute: true,
    });
  }

  public createNewComputer(payload: CreateComputerSchema) {
    return this.post<SuccessResponse<Computer>>('/', payload, {
      isPrivateRoute: true,
    });
  }

  public updateComputer(id: string) {
    return (payload: UpdateComputerSchema) =>
      this.patch<SuccessResponse<Computer>>(`/${id}`, payload, {
        isPrivateRoute: true,
      });
  }

  public softDeleteComputer(id: string) {
    return this.delete(`/${id}`, {
      isPrivateRoute: true,
    });
  }

  public restoreComputer(id: string) {
    return this.patch<SuccessResponse<Computer>>(
      `/restore/${id}`,
      {},
      {
        isPrivateRoute: true,
      },
    );
  }
}

export const computerHttpClient = new ComputerHttpClient();
