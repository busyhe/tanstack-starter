import { createServerOnlyFn } from '@tanstack/react-start'
import { z } from 'zod'

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_VERSION: z.string().min(1).default('development'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
})

export type ServerEnv = z.infer<typeof serverEnvSchema>

let parsedServerEnv: ServerEnv | undefined

export const getServerEnv = createServerOnlyFn(() => (parsedServerEnv ??= serverEnvSchema.parse(process.env)))
