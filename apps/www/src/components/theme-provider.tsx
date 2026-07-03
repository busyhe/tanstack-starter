import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

export type Theme = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'theme'

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: 'light' | 'dark' | undefined
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system'
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'light' || stored === 'dark' ? stored : 'system'
}

function applyTheme(resolved: 'light' | 'dark', theme: Theme) {
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(resolved)
  root.style.colorScheme = resolved
  // Exposes the *selected* mode (incl. 'system') so CSS can target it,
  // e.g. the mode-switcher icons. Kept in sync with the inline init script.
  root.dataset.theme = theme
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Lazy initializers read localStorage synchronously on the client, so no
  // post-hydration setState is needed (first paint is handled by the inline
  // script in __root). On the server they fall back to 'system'/undefined.
  const [theme, setThemeState] = useState<Theme>(getStoredTheme)
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark' | undefined>(() => {
    if (typeof window === 'undefined') return undefined
    const initial = getStoredTheme()
    return initial === 'system' ? getSystemTheme() : initial
  })

  // Follow OS changes while in system mode.
  useEffect(() => {
    if (theme !== 'system') return
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      const next = getSystemTheme()
      setResolvedTheme(next)
      applyTheme(next, 'system')
    }
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [theme])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    localStorage.setItem(STORAGE_KEY, next)
    const resolved = next === 'system' ? getSystemTheme() : next
    setResolvedTheme(resolved)
    applyTheme(resolved, next)
  }, [])

  const value = useMemo(() => ({ theme, resolvedTheme, setTheme }), [theme, resolvedTheme, setTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider')
  return ctx
}
