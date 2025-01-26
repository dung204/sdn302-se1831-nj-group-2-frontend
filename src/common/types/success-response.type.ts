import type { Pagination } from './pagination.type';
import type { Sorting } from './sorting.type';

export type SuccessResponse<T> = T extends unknown[]
  ? {
      data: T;
      meta: {
        pagination: Pagination;
        sorting: Sorting[];
      };
    }
  : { data: T };
