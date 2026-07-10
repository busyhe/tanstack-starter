import { useEffect } from 'react'
import { useRouter, useRouterState } from '@tanstack/react-router'
import { env } from '@/env'

declare global {
  interface Window {
    dataLayer?: unknown[][]
    gtag?: (...args: unknown[]) => void
    __gaInitialized?: boolean
  }
}

export function Analytics() {
  const gaId = env.VITE_GA_ID
  const router = useRouter()
  const href = useRouterState({ select: (state) => state.location.href })

  useEffect(() => {
    if (!gaId) return

    window.dataLayer ??= []
    window.gtag ??= (...args: unknown[]) => {
      window.dataLayer?.push(args)
    }

    if (!window.__gaInitialized) {
      window.gtag('js', new Date())
      window.gtag('config', gaId, { send_page_view: false })
      window.__gaInitialized = true
    }
  }, [gaId])

  useEffect(() => {
    if (!gaId || !window.gtag) return
    window.gtag('event', 'page_view', {
      page_location: window.location.href,
      page_path: `${window.location.pathname}${window.location.search}`,
      page_title: document.title,
    })
  }, [gaId, href])

  if (!gaId) {
    return null
  }

  return (
    <script
      async
      nonce={router.options.ssr?.nonce}
      src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`}
    />
  )
}
