import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SiteFooter } from '@/components/site-footer'
import { siteConfig } from '@/config/site'

describe('SiteFooter', () => {
  it('renders scaffold-safe attribution', () => {
    const config = {
      ...siteConfig,
      name: 'Example product',
      author: undefined,
      links: { homepage: undefined, github: undefined },
    }
    const { container } = render(<SiteFooter config={config} />)

    expect(container.textContent).toContain('Example product')
    expect(screen.queryByRole('link', { name: 'GitHub' })).toBeNull()
  })

  it('renders configured author and source links', () => {
    const config = {
      ...siteConfig,
      author: 'Example team',
      links: {
        homepage: 'https://example.com/team',
        github: 'https://github.com/example/project',
      },
    }
    render(<SiteFooter config={config} />)

    expect(screen.getByRole('link', { name: 'Example team' }).getAttribute('href')).toBe(config.links.homepage)
    expect(screen.getByRole('link', { name: 'GitHub' }).getAttribute('href')).toBe(config.links.github)
  })
})
