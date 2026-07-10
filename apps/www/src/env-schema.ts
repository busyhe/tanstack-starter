import { z } from 'zod'

function trimString(value: unknown) {
  return typeof value === 'string' ? value.trim() : value
}

function emptyStringToUndefined(value: unknown) {
  const normalized = trimString(value)
  return normalized === '' ? undefined : normalized
}

const optionalGaId = z.preprocess(
  emptyStringToUndefined,
  z
    .string()
    .regex(/^G-[A-Z0-9]+$/, 'VITE_GA_ID must be a valid GA4 measurement ID')
    .optional(),
)

const optionalText = (maxLength: number) =>
  z.preprocess(
    emptyStringToUndefined,
    z
      .string()
      .max(maxLength)
      .refine((value) => !/[\r\n]/.test(value), 'Value must be a single line')
      .optional(),
  )

const httpUrl = z.url().refine((value) => {
  const url = new URL(value)
  return (url.protocol === 'http:' || url.protocol === 'https:') && !url.username && !url.password
}, 'URL must use http or https and must not include credentials')

const siteOrigin = httpUrl
  .refine((value) => {
    const url = new URL(value)
    return url.pathname === '/' && !url.search && !url.hash
  }, 'VITE_SITE_URL must be an origin without a path, query, or fragment')
  .transform((value) => new URL(value).origin)

const requiredSiteUrl = z.preprocess(trimString, siteOrigin)
const optionalSiteUrl = z.preprocess(emptyStringToUndefined, siteOrigin.optional())

const optionalHttpUrl = z.preprocess(emptyStringToUndefined, httpUrl.optional())

const optionalTwitterHandle = z.preprocess(
  emptyStringToUndefined,
  z
    .string()
    .regex(/^@?[A-Za-z0-9_]{1,15}$/, 'VITE_TWITTER_HANDLE must be a valid handle')
    .optional(),
)

export function parseClientEnv(input: Record<string, unknown>, isProduction: boolean) {
  return z
    .object({
      VITE_SITE_URL: isProduction ? requiredSiteUrl : optionalSiteUrl,
      VITE_GA_ID: optionalGaId,
      VITE_SITE_NAME: optionalText(80),
      VITE_SITE_DESCRIPTION: optionalText(200),
      VITE_SITE_AUTHOR: optionalText(100),
      VITE_HOMEPAGE_URL: optionalHttpUrl,
      VITE_GITHUB_URL: optionalHttpUrl,
      VITE_TWITTER_HANDLE: optionalTwitterHandle,
    })
    .strict()
    .parse(input)
}

export type ClientEnv = ReturnType<typeof parseClientEnv>
