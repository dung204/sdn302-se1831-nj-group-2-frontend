import type { z } from 'zod';

import { createUsageTrackingSchema } from './create-usage-tracking.type';

export const updateUsageTracking = createUsageTrackingSchema.partial();

export type UpdateUsageTrackingSchema = z.infer<typeof updateUsageTracking>;
