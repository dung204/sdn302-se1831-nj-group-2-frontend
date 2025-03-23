import type { SuccessResponse } from '@/common/types';
import type { CreateServiceSchema, Service, UpdateServiceSchema } from '@/common/types/api/service';
import { envVariables } from '@/common/utils';

import { HttpClient } from './core.http';

class ServiceHttpClient extends HttpClient {
  constructor() {
    super(URL.parse('/services', envVariables.API_ENDPOINT)!.href);
  }

  getAllService() {
    return this.get<SuccessResponse<Service[]>>('/', {
      isPrivateRoute: true,
    });
  }

  getAllDeletedService() {
    return this.get<SuccessResponse<Service[]>>('/deleted', {
      isPrivateRoute: true,
    });
  }

  getServiceById(id: string) {
    return this.get<SuccessResponse<Service>>(`/${id}`, {
      isPrivateRoute: true,
    });
  }

  createNewService(payload: CreateServiceSchema) {
    return this.post<SuccessResponse<Service>>('/', payload, {
      isPrivateRoute: true,
    });
  }

  updateService(id: string) {
    return (payload: UpdateServiceSchema) =>
      this.patch<SuccessResponse<Service>>(`/${id}`, payload, {
        isPrivateRoute: true,
      });
  }

  softDeleteService(id: string) {
    return this.delete<void>(`/${id}`, {
      isPrivateRoute: true,
    });
  }

  restoreService(id: string) {
    return this.patch<void>(`/restore/${id}`, undefined, {
      isPrivateRoute: true,
    });
  }
}

export const serviceHttpClient = new ServiceHttpClient();
