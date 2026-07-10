import { env } from '@/env'

const url = new URL(env.VITE_SITE_URL || 'http://localhost:3000').toString().replace(/\/$/, '')

export const siteConfig = {
  name: env.VITE_SITE_NAME || 'TanStack Starter',
  url,
  ogImage: new URL('logo512.png', `${url}/`).toString(),
  description: env.VITE_SITE_DESCRIPTION || 'A production-minded TanStack Start application starter',
  author: env.VITE_SITE_AUTHOR,
  twitterHandle: env.VITE_TWITTER_HANDLE
    ? env.VITE_TWITTER_HANDLE.startsWith('@')
      ? env.VITE_TWITTER_HANDLE
      : `@${env.VITE_TWITTER_HANDLE}`
    : undefined,
  links: {
    homepage: env.VITE_HOMEPAGE_URL,
    github: env.VITE_GITHUB_URL,
  },
}

export type SiteConfig = typeof siteConfig
