import { z } from 'zod';

export const createUsageTrackingSchema = z.object({
  user: z.string(),
  computer: z.string(),
  startTimeStamp: z.string(),
  endTimestamp: z.string(),
});

export type CreateUsageTrackingSchema = z.infer<typeof createUsageTrackingSchema>;
