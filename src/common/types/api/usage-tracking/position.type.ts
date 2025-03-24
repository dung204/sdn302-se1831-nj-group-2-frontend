export type Position = {
  id: string;
  name: string;
  branch: string;
  status: 'AVAILABLE' | 'IN_USE';
  createTimestamp: string;
  deleteTimestamp?: string;
};
