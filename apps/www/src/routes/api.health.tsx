import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/health')({
  server: {
    handlers: {
      GET: () =>
        Response.json({
          status: 'ok' as const,
          timestamp: new Date().toISOString(),
        }),
    },
  },
})
