import { describe, expect, it } from 'vitest'
import { siteConfig } from '@/config/site'
import { createSeo } from '@/lib/seo'

describe('createSeo', () => {
  it('creates canonical and social metadata from the site configuration', () => {
    const seo = createSeo({ path: '/docs', title: 'Documentation' })

    expect(seo.links).toContainEqual({ rel: 'canonical', href: `${siteConfig.url}/docs` })
    expect(seo.meta).toContainEqual({ property: 'og:title', content: 'Documentation' })
    expect(seo.meta).toContainEqual({ name: 'twitter:card', content: 'summary' })
  })

  it('rejects canonical URLs on another origin', () => {
    expect(() => createSeo({ path: 'https://example.invalid/phishing' })).toThrow(
      'SEO canonical paths must stay on the configured site origin',
    )
  })

  it('removes fragments and does not invent dimensions for custom images', () => {
    const seo = createSeo({ path: '/docs#section', image: 'https://cdn.example.com/social.png' })

    expect(seo.links).toContainEqual({ rel: 'canonical', href: `${siteConfig.url}/docs` })
    expect(seo.meta.some((entry) => 'property' in entry && entry.property === 'og:image:width')).toBe(false)
    expect(() => createSeo({ image: 'data:image/png;base64,AAAA' })).toThrow('SEO images must use http or https')
  })
})
