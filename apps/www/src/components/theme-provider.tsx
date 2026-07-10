import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { META_THEME_COLORS, THEME_STORAGE_KEY } from '@/config/theme'

export type Theme = 'light' | 'dark' | 'system'

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
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system'
  } catch {
    return 'system'
  }
}

function applyTheme(resolved: 'light' | 'dark', theme: Theme) {
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(resolved)
  // Exposes the *selected* mode (incl. 'system') so CSS can target it,
  // e.g. the mode-switcher icons. Kept in sync with the inline init script.
  root.dataset.theme = theme
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', resolved === 'dark' ? META_THEME_COLORS.dark : META_THEME_COLORS.light)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Lazy initializers read localStorage synchronously on the client. The mode
  // switcher's dynamic label explicitly suppresses this expected SSR mismatch;
  // first-paint classes are already applied by the inline script in __root.
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

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) return
      const next = event.newValue === 'light' || event.newValue === 'dark' ? event.newValue : 'system'
      const resolved = next === 'system' ? getSystemTheme() : next
      setThemeState(next)
      setResolvedTheme(resolved)
      applyTheme(resolved, next)
    }

    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // Storage may be disabled by browser privacy settings; the in-memory theme still works.
    }
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
