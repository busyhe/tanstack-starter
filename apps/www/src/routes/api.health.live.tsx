import { createFileRoute } from '@tanstack/react-router'
import { getHealthSnapshot } from '@/lib/api/health'

export const Route = createFileRoute('/api/health/live')({
  server: {
    handlers: {
      GET: () =>
        Response.json(
          {
            ...getHealthSnapshot(),
            kind: 'liveness' as const,
          },
          {
            headers: {
              'Cache-Control': 'no-store',
            },
          },
        ),
    },
  },
})
