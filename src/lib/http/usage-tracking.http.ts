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
    return this.get<SuccessResponse<UsageTracking>>(`/usage-tracking/${id}`, {
      isPrivateRoute: true,
    });
  }

  public createNewUsageTracking(payload: CreateUsageTrackingSchema) {
    return this.post<SuccessResponse<UsageTracking>>('/usage-tracking', payload, {
      isPrivateRoute: true,
    });
  }

  public updateUsageTracking(id: string) {
    return (payload: UpdateUsageTrackingSchema) =>
      this.patch<SuccessResponse<UsageTracking>>(`/usage-tracking/${id}`, payload, {
        isPrivateRoute: true,
      });
  }

  public softDeleteUsageTracking(id: string) {
    return this.delete(`/usage-tracking/${id}`, {
      isPrivateRoute: true,
    });
  }

  public restoreUsageTracking(id: string) {
    return this.patch<SuccessResponse<UsageTracking>>(
      `/usage-tracking/restore/${id}`,
      {},
      {
        isPrivateRoute: true,
      },
    );
  }
}

export const usageTrackingHttpClient = new UsageTrackingHttpClient();
