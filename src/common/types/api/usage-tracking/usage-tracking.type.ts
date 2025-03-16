import type { User } from '../user';
import type { Computer } from './computer.type';

export type UsageTracking = {
  id: string;
  user: User;
  computer: Computer;
  startTimeStamp: string;
  endTimeStamp: string;
  createTimestamp: string;
  deleteTimestamp?: string;
};
