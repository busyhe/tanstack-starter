import { siteConfig, type SiteConfig } from '@/config/site'

export function SiteFooter({ config = siteConfig }: { config?: SiteConfig }) {
  const attribution = config.author ? (
    <span>
      Built by{' '}
      {config.links.homepage ? (
        <a
          href={config.links.homepage}
          target="_blank"
          rel="noreferrer"
          className="font-medium underline underline-offset-4"
        >
          {config.author}
        </a>
      ) : (
        config.author
      )}
      .
    </span>
  ) : (
    <span>
      © {new Date().getFullYear()} {config.name}.
    </span>
  )

  return (
    <footer className="border-grid border-t">
      <div className="container-wrapper">
        <div className="container py-4">
          <div className="flex flex-col justify-between gap-2 text-balance text-center text-sm leading-loose text-muted-foreground md:flex-row md:text-left">
            {attribution}
            {config.links.github && (
              <span>
                The source code is available on{' '}
                <a
                  href={config.links.github}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium underline underline-offset-4"
                >
                  GitHub
                </a>
                .
              </span>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
