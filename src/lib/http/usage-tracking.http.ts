import type { CommonSearchParams, SuccessResponse } from '@/common/types';
import type {
  CreateUsageTrackingSchema,
  UpdateUsageTrackingSchema,
  UsageTracking,
} from '@/common/types/api/usage-tracking';
import { HttpClient } from '@/lib/http/core.http';

class UsageTrackingHttpClient extends HttpClient {
  constructor() {
    super();
  }

  public getAllUsageTrackings(params?: CommonSearchParams) {
    return this.get<SuccessResponse<UsageTracking[]>>('/usage-tracking', {
      params,
      isPrivateRoute: true,
    });
  }

  public getAllDeletedUsageTrackings(params?: CommonSearchParams) {
    return this.get<SuccessResponse<UsageTracking[]>>('/usage-tracking/deleted', {
      params,
      isPrivateRoute: true,
    });
  }

  public getUsageTrackingById(id: string) {
    return this.get<SuccessResponse<UsageTracking>>(`/UsageTrackings/${id}`, {
      isPrivateRoute: true,
    });
  }

  public createNewUsageTracking(payload: CreateUsageTrackingSchema) {
    return this.post<SuccessResponse<UsageTracking>>('/UsageTrackings', payload, {
      isPrivateRoute: true,
    });
  }

  public updateUsageTracking(id: string) {
    return (payload: UpdateUsageTrackingSchema) =>
      this.patch<SuccessResponse<UsageTracking>>(`/UsageTrackings/${id}`, payload, {
        isPrivateRoute: true,
      });
  }

  public softDeleteUsageTracking(id: string) {
    return this.delete(`/UsageTrackings/${id}`, {
      isPrivateRoute: true,
    });
  }

  public restoreUsageTracking(id: string) {
    return this.patch<SuccessResponse<UsageTracking>>(
      `/UsageTrackings/restore/${id}`,
      {},
      {
        isPrivateRoute: true,
      },
    );
  }
}

export const usageTrackingHttpClient = new UsageTrackingHttpClient();
