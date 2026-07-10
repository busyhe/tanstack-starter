import { createFileRoute } from '@tanstack/react-router'
import { getHealthSnapshot } from '@/lib/api/health'

export const Route = createFileRoute('/api/health')({
  server: {
    handlers: {
      GET: () =>
        Response.json(getHealthSnapshot(), {
          headers: {
            'Cache-Control': 'no-store',
          },
        }),
    },
  },
})
