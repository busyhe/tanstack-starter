import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { ThemeProvider } from '@/components/theme-provider'
import { ModeSwitcher } from '@/components/header/mode-switcher'

function renderSwitcher() {
  render(
    <ThemeProvider>
      <ModeSwitcher />
    </ThemeProvider>,
  )
  return screen.getByRole('button', { name: /toggle theme/i })
}

describe('ModeSwitcher', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = ''
    delete document.documentElement.dataset.theme
  })

  it('cycles system → light → dark → system and persists the choice', () => {
    const button = renderSwitcher()
    const root = document.documentElement

    // Defaults to system when nothing is stored.
    expect(button.getAttribute('aria-label')).toContain('system selected; switch to light')
    fireEvent.click(button)
    expect(localStorage.getItem('theme')).toBe('light')
    expect(root.classList.contains('light')).toBe(true)
    expect(root.dataset.theme).toBe('light')
    expect(button.getAttribute('aria-label')).toContain('light selected; switch to dark')

    fireEvent.click(button)
    expect(localStorage.getItem('theme')).toBe('dark')
    expect(root.classList.contains('dark')).toBe(true)
    expect(root.dataset.theme).toBe('dark')

    fireEvent.click(button)
    expect(localStorage.getItem('theme')).toBe('system')
    expect(root.dataset.theme).toBe('system')
    // matchMedia mock resolves system to light.
    expect(root.classList.contains('light')).toBe(true)
  })

  it('restores the stored theme on mount', () => {
    localStorage.setItem('theme', 'dark')
    const button = renderSwitcher()

    // dark → next in cycle is system.
    fireEvent.click(button)
    expect(localStorage.getItem('theme')).toBe('system')
  })

  it('continues to work when browser storage is unavailable', () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Storage unavailable', 'SecurityError')
    })
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Storage unavailable', 'SecurityError')
    })

    try {
      const button = renderSwitcher()
      expect(() => fireEvent.click(button)).not.toThrow()
      expect(document.documentElement.dataset.theme).toBe('light')
    } finally {
      getItem.mockRestore()
      setItem.mockRestore()
    }
  })

  it('synchronizes theme changes from another tab', () => {
    renderSwitcher()

    window.dispatchEvent(new StorageEvent('storage', { key: 'theme', newValue: 'dark' }))

    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })
})
