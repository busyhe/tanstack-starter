import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import { Analytics } from '@/components/analytics'

vi.mock('@/env', () => ({ env: { VITE_GA_ID: 'G-TEST123' } }))
vi.mock('@tanstack/react-router', () => ({
  useRouter: () => ({ options: { ssr: { nonce: 'test-nonce' } } }),
  useRouterState: ({ select }: { select: (state: { location: { href: string } }) => unknown }) =>
    select({ location: { href: '/' } }),
}))

describe('Analytics', () => {
  beforeEach(() => {
    delete window.dataLayer
    delete window.gtag
    delete window.__gaInitialized
  })

  it('renders a nonce-protected script and queues the initial page view', () => {
    render(<Analytics />)
    const script = document.querySelector<HTMLScriptElement>('script[src*="googletagmanager.com/gtag/js"]')

    expect(script?.src).toBe('https://www.googletagmanager.com/gtag/js?id=G-TEST123')
    expect(script?.nonce).toBe('test-nonce')
    expect(window.dataLayer?.some(([command, id]) => command === 'config' && id === 'G-TEST123')).toBe(true)
    expect(window.dataLayer?.some(([command, event]) => command === 'event' && event === 'page_view')).toBe(true)
  })
})
