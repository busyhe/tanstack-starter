import { createFileRoute } from '@tanstack/react-router'
import { getHealthSnapshot } from '@/lib/api/health'

export const Route = createFileRoute('/api/health/ready')({
  server: {
    handlers: {
      GET: () =>
        Response.json(
          {
            ...getHealthSnapshot(),
            kind: 'readiness' as const,
            checks: {
              application: 'ok' as const,
            },
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
