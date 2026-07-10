import { createMiddleware, createStart } from '@tanstack/react-start'
import { isNotFound, isRedirect } from '@tanstack/react-router'
import { getServerEnv } from '@/env.server'
import { env } from '@/env'

const securityHeaders = {
  'Permissions-Policy': 'camera=(), geolocation=(), microphone=()',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
} as const

// Validate once when the server entry is initialized so invalid runtime configuration fails fast.
const serverEnv = getServerEnv()

function createContentSecurityPolicy(nonce: string, isProduction: boolean, analyticsEnabled: boolean) {
  const analyticsScriptSource = analyticsEnabled ? ' https://www.googletagmanager.com' : ''
  const scriptSrc = isProduction
    ? `'self' 'nonce-${nonce}'${analyticsScriptSource}`
    : `'self' 'nonce-${nonce}' 'unsafe-inline' 'unsafe-eval'${analyticsScriptSource}`
  const styleSrc = isProduction ? "'self'" : "'self' 'unsafe-inline'"
  const connectSrc =
    isProduction && analyticsEnabled
      ? "'self' https://www.google-analytics.com https://*.google-analytics.com"
      : isProduction
        ? "'self'"
        : "'self' http: https: ws: wss:"
  const imageSrc = analyticsEnabled ? "'self' data: https://www.google-analytics.com" : "'self' data:"

  return [
    "default-src 'self'",
    "base-uri 'self'",
    `script-src ${scriptSrc}`,
    `style-src ${styleSrc}`,
    "font-src 'self' data:",
    `img-src ${imageSrc}`,
    `connect-src ${connectSrc}`,
    "manifest-src 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
  ].join('; ')
}

interface ResponseSecurityContext {
  cspNonce: string
  requestId: string
  isProduction: boolean
  isHttps: boolean
  noIndex: boolean
}

function secureResponse(response: Response, context: ResponseSecurityContext) {
  const headers = new Headers(response.headers)

  headers.set('X-Request-ID', context.requestId)
  headers.set(
    'Content-Security-Policy',
    createContentSecurityPolicy(context.cspNonce, context.isProduction, Boolean(env.VITE_GA_ID)),
  )
  for (const [name, value] of Object.entries(securityHeaders)) {
    headers.set(name, value)
  }
  if (context.isProduction && context.isHttps) {
    headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }
  if (context.noIndex || response.status >= 400) {
    headers.set('X-Robots-Tag', 'noindex')
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

const requestMiddleware = createMiddleware({ type: 'request' }).server(async ({ request, next }) => {
  const requestId = crypto.randomUUID()
  const cspNonce = crypto.randomUUID().replaceAll('-', '')
  const startedAt = performance.now()
  const { LOG_LEVEL, NODE_ENV } = serverEnv
  const requestUrl = new URL(request.url)
  const isHealthProbe = requestUrl.pathname.startsWith('/api/health')
  const isMachineEndpoint = requestUrl.pathname.startsWith('/api/') || requestUrl.pathname.startsWith('/_serverFn/')
  const responseSecurityContext = {
    cspNonce,
    requestId,
    isProduction: NODE_ENV === 'production',
    isHttps: requestUrl.protocol === 'https:',
    noIndex: isMachineEndpoint,
  }

  try {
    const result = await next({ context: { cspNonce, requestId } })
    const response = secureResponse(result.response, responseSecurityContext)

    if (LOG_LEVEL === 'debug' || (LOG_LEVEL === 'info' && !isHealthProbe)) {
      console.info(
        JSON.stringify({
          event: 'http_request',
          level: 'info',
          method: request.method,
          pathname: requestUrl.pathname,
          requestId,
          status: response.status,
          durationMs: Math.round((performance.now() - startedAt) * 100) / 100,
        }),
      )
    }

    return { ...result, response }
  } catch (error) {
    if (isRedirect(error) || isNotFound(error)) throw error
    if (error instanceof Response) {
      return secureResponse(error, responseSecurityContext)
    }

    console.error(
      JSON.stringify({
        event: 'http_request_error',
        level: 'error',
        method: request.method,
        pathname: requestUrl.pathname,
        requestId,
        durationMs: Math.round((performance.now() - startedAt) * 100) / 100,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
    )
    return secureResponse(
      Response.json(
        { error: 'Internal Server Error', requestId },
        { status: 500, headers: { 'Cache-Control': 'no-store' } },
      ),
      { ...responseSecurityContext, noIndex: true },
    )
  }
})

export const startInstance = createStart(() => ({
  requestMiddleware: [requestMiddleware],
}))
