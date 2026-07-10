import { describe, expect, it } from 'vitest'
import { parseHealthResponse } from '@/lib/api/health'

describe('parseHealthResponse', () => {
  it('accepts the public health contract', () => {
    expect(
      parseHealthResponse({
        status: 'ok',
        timestamp: '2026-07-10T00:00:00.000Z',
        version: 'test',
      }),
    ).toEqual({
      status: 'ok',
      timestamp: '2026-07-10T00:00:00.000Z',
      version: 'test',
    })
  })

  it('rejects malformed responses', () => {
    expect(() => parseHealthResponse({ status: 'ok', timestamp: 'not-a-date' })).toThrow()
  })
})
