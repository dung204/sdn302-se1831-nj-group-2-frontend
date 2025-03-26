import type { SuccessResponse } from '@/common/types';
import type { Bill, BillSearchParams, CreateBillSchema } from '@/common/types/api/bill';
import { envVariables } from '@/common/utils';

import { HttpClient } from './core.http';

class BillHttpClient extends HttpClient {
  constructor() {
    super(`${envVariables.API_ENDPOINT}/bills`);
  }

  getAllBills(params?: BillSearchParams) {
    return this.get<SuccessResponse<Bill[]>>('/', {
      isPrivateRoute: true,
      params,
    });
  }

  getAllDeletedBills(params?: BillSearchParams) {
    return this.get<SuccessResponse<Bill[]>>('/deleted', {
      isPrivateRoute: true,
      params,
    });
  }

  getBillById(id: string) {
    return this.get<SuccessResponse<Bill>>(`/${id}`, {
      isPrivateRoute: true,
    });
  }

  createNewBill(payload: CreateBillSchema) {
    return this.post<SuccessResponse<Bill>>('/', payload, {
      isPrivateRoute: true,
    });
  }

  updateBill(id: string) {
    return (payload: Partial<CreateBillSchema>) =>
      this.patch<SuccessResponse<Bill>>(`/${id}`, payload, {
        isPrivateRoute: true,
      });
  }

  softDeleteBill(id: string) {
    return this.delete<void>(`/${id}`, {
      isPrivateRoute: true,
    });
  }

  restoreBill(id: string) {
    return this.patch<void>(`/restore/${id}`, undefined, {
      isPrivateRoute: true,
    });
  }
}

export const billHttpClient = new BillHttpClient();
