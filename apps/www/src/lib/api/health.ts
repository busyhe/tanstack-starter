import { queryOptions } from '@tanstack/react-query'
import { createServerFn, createServerOnlyFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getServerEnv } from '@/env.server'

/**
 * Data-fetching convention for this app:
 *
 * 1. Co-locate a `queryOptions` factory with its response type here in `lib/api/`.
 * 2. Consume it in components via `useQuery(xxxQueryOptions())`.
 * 3. For SSR/preloading, call `queryClient.ensureQueryData(xxxQueryOptions())`
 *    in a route `loader` — the router's ssr-query integration (see router.tsx)
 *    will dehydrate/rehydrate the cache automatically.
 *
 * Keeping keys + fetchers in one factory guarantees consistent cache keys
 * across loaders, components, prefetching, and invalidation.
 */

export interface HealthResponse {
  status: 'ok'
  timestamp: string
  version: string
}

let responseSchema: z.ZodType<HealthResponse> | undefined

const getHealthResponseSchema = createServerOnlyFn(
  () =>
    (responseSchema ??= z.object({
      status: z.literal('ok'),
      timestamp: z.iso.datetime(),
      version: z.string(),
    })),
)

export const parseHealthResponse = createServerOnlyFn((value: unknown) => getHealthResponseSchema().parse(value))

export const getHealthSnapshot = createServerOnlyFn(() => {
  const { APP_VERSION } = getServerEnv()

  return parseHealthResponse({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: APP_VERSION,
  })
})

// Use POST for the RPC transport so browsers and intermediaries never heuristically cache health data.
export const getHealth = createServerFn({ method: 'POST' }).handler(() => getHealthSnapshot())

export const healthQueryOptions = () =>
  queryOptions({
    queryKey: ['health'],
    queryFn: ({ signal }): Promise<HealthResponse> => getHealth({ signal }),
  })
