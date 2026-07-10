import { describe, expect, it } from 'vitest'
import { parseClientEnv } from '@/env-schema'

describe('parseClientEnv', () => {
  it('requires an HTTP(S) site URL in production', () => {
    expect(() => parseClientEnv({}, true)).toThrow()
    expect(() => parseClientEnv({ VITE_SITE_URL: 'ftp://example.com' }, true)).toThrow()
    expect(() => parseClientEnv({ VITE_SITE_URL: 'https://user:secret@example.com' }, true)).toThrow()
    expect(() => parseClientEnv({ VITE_SITE_URL: 'https://example.com/app' }, true)).toThrow()
    expect(parseClientEnv({ VITE_SITE_URL: ' https://example.com/ ' }, true).VITE_SITE_URL).toBe('https://example.com')
  })

  it('allows development without a site URL', () => {
    expect(parseClientEnv({}, false).VITE_SITE_URL).toBeUndefined()
    expect(parseClientEnv({ VITE_SITE_URL: '' }, false).VITE_SITE_URL).toBeUndefined()
  })

  it('accepts only GA4 measurement IDs and treats an empty value as disabled', () => {
    expect(parseClientEnv({ VITE_GA_ID: '' }, false).VITE_GA_ID).toBeUndefined()
    expect(parseClientEnv({ VITE_GA_ID: 'G-ABC123' }, false).VITE_GA_ID).toBe('G-ABC123')
    expect(() => parseClientEnv({ VITE_GA_ID: "G-X';alert(1)//" }, false)).toThrow()
  })

  it('validates optional public metadata', () => {
    const env = parseClientEnv(
      {
        VITE_GITHUB_URL: 'https://github.com/example/project',
        VITE_SITE_AUTHOR: '   ',
        VITE_SITE_NAME: ' Example product ',
        VITE_TWITTER_HANDLE: 'example_user',
      },
      false,
    )

    expect(env.VITE_GITHUB_URL).toBe('https://github.com/example/project')
    expect(env.VITE_SITE_AUTHOR).toBeUndefined()
    expect(env.VITE_SITE_NAME).toBe('Example product')
    expect(env.VITE_TWITTER_HANDLE).toBe('example_user')
    expect(() => parseClientEnv({ VITE_TWITTER_HANDLE: '@not-valid!' }, false)).toThrow()
    expect(() => parseClientEnv({ VITE_SITE_DESCRIPTION: 'first\nsecond' }, false)).toThrow()
  })

  it('rejects undeclared VITE variables', () => {
    expect(() => parseClientEnv({ VITE_GAID: 'G-ABC123' }, false)).toThrow()
  })
})
