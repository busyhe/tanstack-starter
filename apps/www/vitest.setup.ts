import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Testing Library only auto-cleans when vitest globals are enabled; do it explicitly.
afterEach(() => {
  cleanup()
})

// jsdom does not implement matchMedia; the theme system depends on it.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
