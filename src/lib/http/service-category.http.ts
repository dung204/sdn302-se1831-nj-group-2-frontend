import type { SuccessResponse } from '@/common/types';
import type {
  CreateServiceCategorySchema,
  ServiceCategory,
  ServiceCategorySearchParams,
  UpdateServiceCategorySchema,
} from '@/common/types/api/service-category';
import { envVariables } from '@/common/utils';

import { HttpClient } from './core.http';

class ServiceCategoryHttpClient extends HttpClient {
  constructor() {
    super(`${envVariables.API_ENDPOINT}/service-categories`);
  }

  getAllServiceCategories(params?: ServiceCategorySearchParams) {
    return this.get<SuccessResponse<ServiceCategory[]>>('/', {
      isPrivateRoute: true,
      params,
    });
  }

  getAllDeletedServiceCategories(params?: ServiceCategorySearchParams) {
    return this.get<SuccessResponse<ServiceCategory[]>>('/deleted', {
      isPrivateRoute: true,
      params,
    });
  }

  getServiceCategoryById(id: string) {
    return this.get<SuccessResponse<ServiceCategory>>(`/${id}`, {
      isPrivateRoute: true,
    });
  }

  createNewServiceCategory(payload: CreateServiceCategorySchema) {
    return this.post<SuccessResponse<ServiceCategory>>('/', payload, {
      isPrivateRoute: true,
    });
  }

  updateServiceCategory(id: string) {
    return (payload: UpdateServiceCategorySchema) =>
      this.patch<SuccessResponse<ServiceCategory>>(`/${id}`, payload, {
        isPrivateRoute: true,
      });
  }

  softDeleteServiceCategory(id: string) {
    return this.delete<void>(`/${id}`, {
      isPrivateRoute: true,
    });
  }

  restoreServiceCategory(id: string) {
    return this.patch<void>(`/restore/${id}`, undefined, {
      isPrivateRoute: true,
    });
  }
}

export const serviceCategoryHttpClient = new ServiceCategoryHttpClient();
