import type { BaseModel } from '@/common/types';

export enum ServiceStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface Bill extends BaseModel {
  user: string;
  computer: {
    _id: string;
    name: string;
    pricePerHour: number;
    holdingFee: number;
  };
  services: {
    _id: string;
    name: string;
    price: number;
    quantity: number;
    status: ServiceStatus;
  }[];
  startTimestamp: Date | null;
  endTimestamp: Date | null;
  maxEndTimestamp: Date | null;
  maxHoldingTimestamp: Date | null;
  totalPrice: number;
}
