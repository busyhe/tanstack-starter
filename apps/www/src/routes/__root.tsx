import { HeadContent, Scripts, createRootRouteWithContext, useRouter } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { Link } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { Providers } from '@/components/providers'
import { Analytics } from '@/components/analytics'
import { Button } from '@workspace/ui/components/button'
import { siteConfig } from '@/config/site'
import { META_THEME_COLORS, THEME_STORAGE_KEY } from '@/config/theme'
import type { ErrorComponentProps } from '@tanstack/react-router'

import appCss from '../styles.css?url'

const THEME_INIT_SCRIPT = `(function(){var t;try{t=localStorage.getItem('${THEME_STORAGE_KEY}')}catch(e){}var m=t==='light'||t==='dark'?t:'system';var d=m==='dark'||(m==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;r.classList.add(d?'dark':'light');r.dataset.theme=m;var c=document.querySelector('meta[name="theme-color"]');if(c)c.setAttribute('content',d?'${META_THEME_COLORS.dark}':'${META_THEME_COLORS.light}')})()`

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => {
    return {
      meta: [
        { charSet: 'utf-8' },
        { title: siteConfig.name },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: siteConfig.description },
        { name: 'keywords', content: 'TanStack Start,React,TypeScript' },
        ...(siteConfig.author
          ? [
              { name: 'author', content: siteConfig.author },
              { name: 'creator', content: siteConfig.author },
            ]
          : []),
        { name: 'theme-color', content: META_THEME_COLORS.light },
      ],
      links: [
        { rel: 'stylesheet', href: appCss },
        { rel: 'icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', href: '/logo192.png' },
        { rel: 'manifest', href: '/manifest.json' },
      ],
      scripts: [{ children: THEME_INIT_SCRIPT }],
    }
  },
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
  errorComponent: RootError,
  onError: reportRouteError,
  onCatch: reportRouteError,
})

function reportRouteError(error: unknown) {
  console.error('Route error', error)
}

function RootError({ error }: ErrorComponentProps) {
  const router = useRouter()

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4 text-foreground">
      <section className="max-w-lg text-center" aria-live="polite">
        <h1 className="text-3xl font-semibold">Something went wrong</h1>
        <p className="mt-4 text-muted-foreground">The page could not be loaded. Please retry or return home.</p>
        {import.meta.env.DEV && <pre className="mt-4 overflow-auto text-left text-sm">{error.message}</pre>}
        <div className="mt-6 flex justify-center gap-2">
          <Button type="button" onClick={() => void router.invalidate({ forcePending: true })}>
            Retry
          </Button>
          <Button asChild variant="outline">
            <Link to="/">Back to home</Link>
          </Button>
        </div>
      </section>
    </main>
  )
}

function NotFound() {
  return (
    <main>
      <section className="bg-background">
        <div className="flex min-h-screen flex-col items-center justify-center text-center text-foreground">
          <h1 className="mt-8 text-4xl md:text-6xl">Page Not Found</h1>
          <Button asChild variant="link">
            <Link to="/">Back to home</Link>
          </Button>
        </div>
      </section>
    </main>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
        <Analytics />
        {import.meta.env.DEV && (
          <TanStackDevtools
            config={{
              position: 'bottom-right',
            }}
            plugins={[
              {
                name: 'TanStack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
        )}
        <Scripts />
      </body>
    </html>
  )
}
