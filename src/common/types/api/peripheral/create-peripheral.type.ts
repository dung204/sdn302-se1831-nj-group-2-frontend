import { z } from 'zod';

import { PeripheralType } from './peripheral-type.enum';

export const createPeripheralSchema = z.object({
  name: z.string().nonempty(),
  brand: z.string().nonempty(),
  type: z.nativeEnum(PeripheralType),
  importPrice: z.coerce.number().positive(),
  provider: z.string().nonempty(),
});

export type CreatePeripheralSchema = z.infer<typeof createPeripheralSchema>;
