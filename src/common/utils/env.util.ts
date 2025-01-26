import { z } from 'zod';

const envSchema = z
  .object({
    MODE: z.enum(['production', 'development', 'staging']),
    BASE_URL: z.string().nonempty(),
    SSR: z.boolean(),
    VITE_API_ENDPOINT: z.string().nonempty(),
  })
  .transform(({ VITE_API_ENDPOINT, ...env }) => ({
    ...env,
    API_ENDPOINT: VITE_API_ENDPOINT,
  }));

/**
 * For more information of env in Vite: https://vite.dev/guide/env-and-mode
 */
export const envVariables = envSchema.parse(import.meta.env);
