import type { SuccessResponse } from '@/common/types';
import type {
  CreateUsageTrackingSchema,
  UpdateUsageTrackingSchema,
  UsageTracking,
} from '@/common/types/api/usage-tracking';
import { envVariables } from '@/common/utils';

import { HttpClient } from './core.http';

class UsageTrackingHttpClient extends HttpClient {
  constructor() {
    super(URL.parse('/usage-tracking', envVariables.API_ENDPOINT)!.href);
  }

  getAllUsageTracking() {
    return this.get<SuccessResponse<UsageTracking[]>>('/', {
      isPrivateRoute: true,
    });
  }

  getAllDeletedUsageTracking() {
    return this.get<SuccessResponse<UsageTracking[]>>('/deleted', {
      isPrivateRoute: true,
    });
  }

  getUsageTrackingById(id: string) {
    return this.get<SuccessResponse<UsageTracking>>(`/${id}`, {
      isPrivateRoute: true,
    });
  }

  createNewUsageTracking(payload: CreateUsageTrackingSchema) {
    return this.post<SuccessResponse<UsageTracking>>('/', payload, {
      isPrivateRoute: true,
    });
  }

  updateUsageTracking(id: string) {
    return (payload: UpdateUsageTrackingSchema) =>
      this.patch<SuccessResponse<UsageTracking>>(`/${id}`, payload, {
        isPrivateRoute: true,
      });
  }

  softDeleteUsageTracking(id: string) {
    return this.delete<void>(`/${id}`, {
      isPrivateRoute: true,
    });
  }

  restoreUsageTracking(id: string) {
    return this.patch<void>(`/restore/${id}`, undefined, {
      isPrivateRoute: true,
    });
  }
}

export const usageTrackingHttpClient = new UsageTrackingHttpClient();
