import { z } from 'zod';

export const createUsageTrackingSchema = z.object({
  user: z.string().nonempty('A user must be selected'),
  computer: z.string().nonempty('A computer must be selected'),
  startTimeStamp: z.string().nonempty('Start timestamp is required'),
  endTimeStamp: z.string().nonempty('End timestamp is required'),
});

export type CreateUsageTrackingSchema = z.infer<typeof createUsageTrackingSchema>;
