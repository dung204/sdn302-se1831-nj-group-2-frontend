import type { CommonSearchParams, SuccessResponse } from '@/common/types';
import type { Provider } from '@/common/types/api/computer';
import { HttpClient } from '@/lib/http/core.http';

class ProviderHttpClient extends HttpClient {
  constructor() {
    super();
  }

  public getAllProviders(params?: CommonSearchParams) {
    return this.get<SuccessResponse<Provider[]>>('/providers', {
      params,
      isPrivateRoute: true,
    });
  }
}
export const providerHttpClient = new ProviderHttpClient();
