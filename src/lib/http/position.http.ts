import type { CommonSearchParams, SuccessResponse } from '@/common/types';
import type {
  CreatePositionSchema,
  Position,
  UpdatePositionSchema,
} from '@/common/types/api/position';
import { envVariables } from '@/common/utils';

import { HttpClient } from './core.http';

class PositionHttpClient extends HttpClient {
  constructor() {
    super(URL.parse('/api/v1', envVariables.API_ENDPOINT)!.href);
  }

  public getAllPositions(params?: CommonSearchParams) {
    return this.get<SuccessResponse<Position[]>>('/positions', {
      params,
      isPrivateRoute: true,
    });
  }

  getAllDeletedPosition() {
    return this.get<SuccessResponse<Position[]>>('/deleted', {
      isPrivateRoute: true,
    });
  }

  getPositionById(id: string) {
    return this.get<SuccessResponse<Position>>(`/${id}`, {
      isPrivateRoute: true,
    });
  }

  createNewPosition(payload: CreatePositionSchema) {
    return this.post<SuccessResponse<Position>>('/', payload, {
      isPrivateRoute: true,
    });
  }

  updatePosition(id: string) {
    return (payload: UpdatePositionSchema) =>
      this.patch<SuccessResponse<Position>>(`/${id}`, payload, {
        isPrivateRoute: true,
      });
  }

  softDeletePosition(id: string) {
    return this.delete<void>(`/${id}`, {
      isPrivateRoute: true,
    });
  }

  restorePosition(id: string) {
    return this.patch<void>(`/restore/${id}`, undefined, {
      isPrivateRoute: true,
    });
  }
}

export const positionHttpClient = new PositionHttpClient();
