import { HeadContent, Scripts, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { Link } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { Providers } from '@/components/providers'
import { Analytics } from '@/components/analytics'
import { Button } from '@workspace/ui/components/button'
import { siteConfig, META_THEME_COLORS } from '@/config/site'

import appCss from '../styles.css?url'

const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('theme');var d=t==='dark'||((!t||t==='system')&&matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;r.classList.add(d?'dark':'light');r.style.colorScheme=d?'dark':'light'}catch(e){}})()`

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: siteConfig.name },
      { name: 'description', content: siteConfig.description },
      { name: 'keywords', content: 'TanStack,React,Starter' },
      { name: 'author', content: 'busyhe' },
      { name: 'creator', content: 'busyhe' },
      { name: 'theme-color', content: META_THEME_COLORS.light, media: '(prefers-color-scheme: light)' },
      { name: 'theme-color', content: META_THEME_COLORS.dark, media: '(prefers-color-scheme: dark)' },
      // Open Graph
      { property: 'og:type', content: 'website' },
      { property: 'og:locale', content: 'en_US' },
      { property: 'og:url', content: siteConfig.url },
      { property: 'og:title', content: siteConfig.name },
      { property: 'og:description', content: siteConfig.description },
      { property: 'og:site_name', content: siteConfig.name },
      { property: 'og:image', content: siteConfig.ogImage },
      { property: 'og:image:width', content: '512' },
      { property: 'og:image:height', content: '512' },
      // Twitter
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: siteConfig.name },
      { name: 'twitter:description', content: siteConfig.description },
      { name: 'twitter:image', content: siteConfig.ogImage },
      { name: 'twitter:creator', content: '@busyhe' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.ico' },
      { rel: 'apple-touch-icon', href: '/logo192.png' },
      { rel: 'manifest', href: '/manifest.json' },
    ],
    scripts: [{ children: THEME_INIT_SCRIPT }],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
})

function NotFound() {
  return (
    <main>
      <section className="bg-background">
        <div className="flex min-h-screen flex-col items-center justify-center text-center text-foreground">
          <h1 className="mt-8 text-4xl md:text-6xl">Page Not Found</h1>
          <Link to="/">
            <Button variant="link">Back to home</Button>
          </Link>
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
