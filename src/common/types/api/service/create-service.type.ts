import { z } from 'zod';

export const createServiceSchema = z.object({
  name: z.string().nonempty('Name is required'),
  description: z.string(),
  price: z.coerce
    .number({ message: 'Price must be a positive number' })
    .positive('Price must be a positive number'),
  category: z.string().nonempty('A category must be selected'),
  branches: z
    .union([z.string().transform((value) => value.split(',')), z.array(z.string())])
    .transform((value) => [...new Set(value)])
    .optional()
    .default([]),
});

export type CreateServiceSchema = z.infer<typeof createServiceSchema>;
