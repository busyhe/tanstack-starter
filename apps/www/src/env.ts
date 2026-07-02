import { z } from 'zod'

/**
 * All VITE_* environment variables must be declared and validated here.
 * Read env values from this module only — never from import.meta.env directly.
 */
const envSchema = z.object({
  VITE_SITE_URL: z.url().optional(),
  VITE_GA_ID: z.string().optional(),
})

export const env = envSchema.parse(import.meta.env)
