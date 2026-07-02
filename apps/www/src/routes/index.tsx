import { createFileRoute } from '@tanstack/react-router'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

export const Route = createFileRoute('/')({ component: HomePage })

function HomePage() {
  return (
    <div data-wrapper="" className="border-grid flex flex-1 flex-col min-h-svh">
      <SiteHeader />
      <main className="flex flex-1 flex-col container-wrapper">
        <section className="relative isolate min-h-[calc(100svh-7rem)] overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,color-mix(in_oklch,var(--color-primary)_14%,transparent),transparent_42%)]" />
          <div className="container relative flex min-h-[calc(100svh-7rem)] items-center py-16 md:py-24">
            <div className="max-w-3xl">
              <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                TanStack Start starter
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-normal text-foreground sm:text-5xl md:text-6xl">
                Build fast React apps with TanStack Start.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                A clean starter surface with TanStack Router, Tailwind CSS, and shadcn/ui ready to customize.
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
