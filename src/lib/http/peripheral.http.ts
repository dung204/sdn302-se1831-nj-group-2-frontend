import type { SuccessResponse } from '@/common/types';
import type {
  CreatePeripheralSchema,
  Peripheral,
  PeripheralSearchParams,
  UpdatePeripheralSchema,
} from '@/common/types/api/peripheral';
import { envVariables } from '@/common/utils';

import { HttpClient } from './core.http';

class PeripheralHttpClient extends HttpClient {
  constructor() {
    super(`${envVariables.API_ENDPOINT}/peripherals`);
  }

  getAllPeripherals(params?: PeripheralSearchParams) {
    return this.get<SuccessResponse<Peripheral[]>>('/', {
      isPrivateRoute: true,
      params,
    });
  }

  getAllDeletedPeripherals(params?: PeripheralSearchParams) {
    return this.get<SuccessResponse<Peripheral[]>>('/deleted', {
      isPrivateRoute: true,
      params,
    });
  }

  getPeripheralById(id: string) {
    return this.get<SuccessResponse<Peripheral>>(`/${id}`, {
      isPrivateRoute: true,
    });
  }

  createNewPeripheral(payload: CreatePeripheralSchema) {
    return this.post<SuccessResponse<Peripheral>>('/', payload, {
      isPrivateRoute: true,
    });
  }

  updatePeripheral(id: string) {
    return (payload: UpdatePeripheralSchema) =>
      this.patch<SuccessResponse<Peripheral>>(`/${id}`, payload, {
        isPrivateRoute: true,
      });
  }

  softDeletePeripheral(id: string) {
    return this.delete<void>(`/${id}`, {
      isPrivateRoute: true,
    });
  }

  restorePeripheral(id: string) {
    return this.patch<void>(`/restore/${id}`, undefined, {
      isPrivateRoute: true,
    });
  }
}

export const peripheralHttpClient = new PeripheralHttpClient();
