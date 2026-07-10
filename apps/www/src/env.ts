import type { ClientEnv } from '@/env-schema'

/**
 * All VITE_* environment variables must be declared in env-schema.ts and validated by Vite.
 * Read env values from this module only — never from import.meta.env directly.
 */
const optional = (value: string | undefined) => value?.trim() || undefined
const siteUrl = optional(import.meta.env.VITE_SITE_URL)

export const env: ClientEnv = {
  VITE_SITE_URL: siteUrl ? new URL(siteUrl).origin : undefined,
  VITE_GA_ID: optional(import.meta.env.VITE_GA_ID),
  VITE_SITE_NAME: optional(import.meta.env.VITE_SITE_NAME),
  VITE_SITE_DESCRIPTION: optional(import.meta.env.VITE_SITE_DESCRIPTION),
  VITE_SITE_AUTHOR: optional(import.meta.env.VITE_SITE_AUTHOR),
  VITE_HOMEPAGE_URL: optional(import.meta.env.VITE_HOMEPAGE_URL),
  VITE_GITHUB_URL: optional(import.meta.env.VITE_GITHUB_URL),
  VITE_TWITTER_HANDLE: optional(import.meta.env.VITE_TWITTER_HANDLE),
}
