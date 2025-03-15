import type { CommonSearchParams, SuccessResponse } from '@/common/types';
import type {
  CreateServiceCategorieSchema,
  ServiceCategories,
  UpdateServiceCategoriesSchema,
} from '@/common/types/api/service-categories';
import { HttpClient } from '@/lib/http/core.http';

class ServiceCategoriesHttpClient extends HttpClient {
  constructor() {
    super();
  }

  public getAllServiceCategories(params?: CommonSearchParams) {
    return this.get<SuccessResponse<ServiceCategories[]>>('/service-categories', {
      params,
      isPrivateRoute: true,
    });
  }

  public getAllDeletedServiceCategories(params?: CommonSearchParams) {
    return this.get<SuccessResponse<ServiceCategories[]>>('/service-categories/deleted', {
      params,
      isPrivateRoute: true,
    });
  }

  public getServiceCategoriesById(id: string) {
    return this.get<SuccessResponse<ServiceCategories>>(`/service-categories/${id}`, {
      isPrivateRoute: true,
    });
  }

  public createNewServiceCategories(payload: CreateServiceCategorieSchema) {
    return this.post<SuccessResponse<ServiceCategories>>('/service-categories', payload, {
      isPrivateRoute: true,
    });
  }

  public updateServiceCategories(id: string) {
    return (payload: UpdateServiceCategoriesSchema) =>
      this.patch<SuccessResponse<ServiceCategories>>(`/service-categories/${id}`, payload, {
        isPrivateRoute: true,
      });
  }

  public softDeleteServiceCategories(id: string) {
    return this.delete(`/service-categories/${id}`, {
      isPrivateRoute: true,
    });
  }

  public restoreServiceCategories(id: string) {
    return this.patch<SuccessResponse<ServiceCategories>>(
      `/service-categories/restore/${id}`,
      {},
      {
        isPrivateRoute: true,
      },
    );
  }
}

export const serviceCategoriesHttpClient = new ServiceCategoriesHttpClient();
