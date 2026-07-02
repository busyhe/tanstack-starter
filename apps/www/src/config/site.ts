const url = import.meta.env.VITE_SITE_URL || 'http://localhost:3000'

export const siteConfig = {
  name: 'TanStack Starter',
  url,
  ogImage: `${url}/logo512.png`,
  description: 'A starter template for TanStack Start with Shadcn UI and Tailwind CSS',
  links: {
    homepage: 'https://busyhe.com',
    twitter: 'https://twitter.com/busyhe_',
    github: 'https://github.com/busyhe',
  },
}

export type SiteConfig = typeof siteConfig

export const META_THEME_COLORS = {
  light: '#ffffff',
  dark: '#09090b',
}
