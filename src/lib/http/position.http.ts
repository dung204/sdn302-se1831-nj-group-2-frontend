import type { CommonSearchParams, SuccessResponse } from '@/common/types';
import type { Position } from '@/common/types/api/computer';
import { HttpClient } from '@/lib/http/core.http';

class PositionHttpClient extends HttpClient {
  constructor() {
    super();
  }

  public getAllPositions(params?: CommonSearchParams) {
    return this.get<SuccessResponse<Position>>('/positions', {
      params,
      isPrivateRoute: true,
    });
  }
}

export const positionHttpClient = new PositionHttpClient();
