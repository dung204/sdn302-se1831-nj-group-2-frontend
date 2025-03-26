import { z } from 'zod';

export const createBillSchema = z.object({
  // TODO: Add additional properties
  user: z.string().nonempty('A user must be selected'),
  computer: z.string().nonempty('A computer must be selected'),
  service: z.array(z.string()).nonempty('At least one service must be selected'),
  startTimeStamp: z.string().nonempty('Start timestamp is required'),
  endTimeStamp: z.string().nonempty('End timestamp is required'),
  maxEndTimestamp: z.string().nonempty('Max end timestamp is required'),
  maxHoldingTimestamp: z.string().nonempty('Max holding timestamp is required'),
  totalPrice: z.coerce.number(),
});

export type CreateBillSchema = z.infer<typeof createBillSchema>;
