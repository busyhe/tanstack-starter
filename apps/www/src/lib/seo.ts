import { siteConfig } from '@/config/site'

interface SeoOptions {
  title?: string
  description?: string
  path?: string
  image?: string
  imageAlt?: string
}

export function createSeo({
  title = siteConfig.name,
  description = siteConfig.description,
  path = '/',
  image = siteConfig.ogImage,
  imageAlt = `${siteConfig.name} preview`,
}: SeoOptions = {}) {
  const canonical = new URL(path, `${siteConfig.url}/`)
  const imageUrl = new URL(image, `${siteConfig.url}/`)

  if (canonical.origin !== new URL(siteConfig.url).origin) {
    throw new Error('SEO canonical paths must stay on the configured site origin')
  }
  if (imageUrl.protocol !== 'http:' && imageUrl.protocol !== 'https:') {
    throw new Error('SEO images must use http or https')
  }

  canonical.hash = ''
  const canonicalUrl = canonical.toString()

  return {
    meta: [
      { title },
      { name: 'description', content: description },
      { property: 'og:type', content: 'website' },
      { property: 'og:locale', content: 'en_US' },
      { property: 'og:url', content: canonicalUrl },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:site_name', content: siteConfig.name },
      { property: 'og:image', content: imageUrl.toString() },
      { property: 'og:image:alt', content: imageAlt },
      { name: 'twitter:card', content: 'summary' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: imageUrl.toString() },
      { name: 'twitter:image:alt', content: imageAlt },
      ...(siteConfig.twitterHandle ? [{ name: 'twitter:creator', content: siteConfig.twitterHandle }] : []),
    ],
    links: [{ rel: 'canonical', href: canonicalUrl }],
  }
}
