import { z } from 'zod';

import { createProviderSchema } from './create-provider.type';

export const updateProviderSchema = createProviderSchema.partial();

export type UpdateProviderSchema = z.infer<typeof updateProviderSchema>;
