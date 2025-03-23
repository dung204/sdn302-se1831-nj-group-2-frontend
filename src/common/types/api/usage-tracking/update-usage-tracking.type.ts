import { z } from 'zod';

import { createUsageTrackingSchema } from './create-usage-tracking.type';

export const updateUsageTrackingSchema = createUsageTrackingSchema.partial();

export type UpdateUsageTrackingSchema = z.infer<typeof updateUsageTrackingSchema>;
