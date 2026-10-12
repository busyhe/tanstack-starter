import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Route } from './__root'

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return {
    ...actual,
    useRouter: () => ({ invalidate: vi.fn() }),
    Link: ({ children }: { children: ReactNode }) => <a href="/">{children}</a>,
  }
})

describe('root error page', () => {
  const ErrorComponent = Route.options.errorComponent
  if (!ErrorComponent) throw new Error('Root error component must be configured')

  it('shows Error details in development', () => {
    render(<ErrorComponent error={new Error('Failed to load data')} reset={vi.fn()} />)

    expect(screen.getByText('Failed to load data')).toBeTruthy()
  })

  it.each([null, undefined, 'Request failed', { message: { unexpected: true } }])(
    'handles a non-Error thrown value: %j',
    (error) => {
      render(<ErrorComponent error={error} reset={vi.fn()} />)

      expect(screen.getByRole('heading', { name: 'Something went wrong' })).toBeTruthy()
      expect(screen.getByText('Unknown error')).toBeTruthy()
    },
  )
})
