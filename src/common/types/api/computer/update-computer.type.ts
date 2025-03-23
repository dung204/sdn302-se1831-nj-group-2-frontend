import { z } from 'zod';

import { createComputerSchema } from './create-computer.type';

export const updateComputerSchema = createComputerSchema.partial();

export type UpdateComputerSchema = z.infer<typeof updateComputerSchema>;
