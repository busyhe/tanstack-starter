import { beforeEach, describe, expect, it } from 'vitest'
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
    fireEvent.click(button)
    expect(localStorage.getItem('theme')).toBe('light')
    expect(root.classList.contains('light')).toBe(true)
    expect(root.dataset.theme).toBe('light')

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
})
