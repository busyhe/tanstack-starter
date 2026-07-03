import { queryOptions } from '@tanstack/react-query'

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
}

export const healthQueryOptions = () =>
  queryOptions({
    queryKey: ['health'],
    queryFn: async (): Promise<HealthResponse> => {
      const res = await fetch('/api/health')
      if (!res.ok) throw new Error(`Health check failed with status ${res.status}`)
      return res.json() as Promise<HealthResponse>
    },
  })
