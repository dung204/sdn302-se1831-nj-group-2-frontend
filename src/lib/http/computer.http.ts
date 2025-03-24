import type { SuccessResponse } from '@/common/types';
import type {
  Computer,
  CreateComputerSchema,
  UpdateComputerSchema,
} from '@/common/types/api/computer';
import { envVariables } from '@/common/utils';

import { HttpClient } from './core.http';

class ComputerHttpClient extends HttpClient {
  constructor() {
    // super(URL.parse('/computers', envVariables.API_ENDPOINT)!.href);
    super(`${envVariables.API_ENDPOINT}/computers`);
  }

  getAllComputer() {
    return this.get<SuccessResponse<Computer[]>>('/', {
      isPrivateRoute: true,
    });
  }

  getAllDeletedComputer() {
    return this.get<SuccessResponse<Computer[]>>('/deleted', {
      isPrivateRoute: true,
    });
  }

  getComputerById(id: string) {
    return this.get<SuccessResponse<Computer>>(`/${id}`, {
      isPrivateRoute: true,
    });
  }

  createNewComputer(payload: CreateComputerSchema) {
    return this.post<SuccessResponse<Computer>>('/', payload, {
      isPrivateRoute: true,
    });
  }

  updateComputer(id: string) {
    return (payload: UpdateComputerSchema) =>
      this.patch<SuccessResponse<Computer>>(`/${id}`, payload, {
        isPrivateRoute: true,
      });
  }

  softDeleteComputer(id: string) {
    return this.delete<void>(`/${id}`, {
      isPrivateRoute: true,
    });
  }

  restoreComputer(id: string) {
    return this.patch<void>(`/restore/${id}`, undefined, {
      isPrivateRoute: true,
    });
  }
}

export const computerHttpClient = new ComputerHttpClient();
