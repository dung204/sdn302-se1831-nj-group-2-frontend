import { z } from 'zod';

export const createUsageTrackingSchema = z.object({
  user: z.string(),
  computer: z.string(),
  startTimeStamp: z.coerce.date(),
  endTimeStamp: z.coerce.date(),
});

export type CreateUsageTrackingSchema = z.infer<typeof createUsageTrackingSchema>;
