import { z } from 'zod';

import { PeripheralType } from './peripheral-type.enum';

export const createPeripheralSchema = z.object({
  name: z.string().nonempty('Name is required'),
  brand: z.string().nonempty('Brand is required'),
  type: z.nativeEnum(PeripheralType, { required_error: 'Type is required' }),
  importPrice: z.coerce
    .number({ message: 'Import price must be a positive number' })
    .positive('Import price must be a positive number'),
  provider: z.string().nonempty('A provider must be selected'),
});

export type CreatePeripheralSchema = z.infer<typeof createPeripheralSchema>;
