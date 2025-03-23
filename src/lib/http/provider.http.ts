import type { SuccessResponse } from '@/common/types';
import type {
  CreateProviderSchema,
  Provider,
  UpdateProviderSchema,
} from '@/common/types/api/provider';
import { envVariables } from '@/common/utils';

import { HttpClient } from './core.http';

class ProviderHttpClient extends HttpClient {
  constructor() {
    super(URL.parse('/providers', envVariables.API_ENDPOINT)!.href);
  }

  getAllProvider() {
    return this.get<SuccessResponse<Provider[]>>('/', {
      isPrivateRoute: true,
    });
  }

  getAllDeletedProvider() {
    return this.get<SuccessResponse<Provider[]>>('/deleted', {
      isPrivateRoute: true,
    });
  }

  getProviderById(id: string) {
    return this.get<SuccessResponse<Provider>>(`/${id}`, {
      isPrivateRoute: true,
    });
  }

  createNewProvider(payload: CreateProviderSchema) {
    return this.post<SuccessResponse<Provider>>('/', payload, {
      isPrivateRoute: true,
    });
  }

  updateProvider(id: string) {
    return (payload: UpdateProviderSchema) =>
      this.patch<SuccessResponse<Provider>>(`/${id}`, payload, {
        isPrivateRoute: true,
      });
  }

  softDeleteProvider(id: string) {
    return this.delete<void>(`/${id}`, {
      isPrivateRoute: true,
    });
  }

  restoreProvider(id: string) {
    return this.patch<void>(`/restore/${id}`, undefined, {
      isPrivateRoute: true,
    });
  }
}

export const providerHttpClient = new ProviderHttpClient();
