import { z } from 'zod';

import { createPeripheralSchema } from './create-peripheral.type';

export const updatePeripheralSchema = createPeripheralSchema.partial();

export type UpdatePeripheralSchema = z.infer<typeof updatePeripheralSchema>;
