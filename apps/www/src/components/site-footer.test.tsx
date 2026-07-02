import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SiteFooter } from '@/components/site-footer'
import { siteConfig } from '@/config/site'

describe('SiteFooter', () => {
  it('renders attribution links', () => {
    render(<SiteFooter />)

    const homepageLink = screen.getByRole('link', { name: 'busyhe' })
    expect(homepageLink.getAttribute('href')).toBe(siteConfig.links.homepage)

    const githubLink = screen.getByRole('link', { name: 'GitHub' })
    expect(githubLink.getAttribute('href')).toBe(siteConfig.links.github)
  })
})
