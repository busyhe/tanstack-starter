import { useCallback } from 'react'
import { MonitorIcon, MoonIcon, SunIcon } from 'lucide-react'
import { useTheme, type Theme } from '@/components/theme-provider'
import { Button } from '@workspace/ui/components/button'

const CYCLE: Record<Theme, Theme> = {
  light: 'dark',
  dark: 'system',
  system: 'light',
}

/**
 * Cycles light → dark → system. Icons are CSS-driven off `html[data-theme]`
 * (set by the inline init script and ThemeProvider) so SSR markup never
 * mismatches the client.
 */
export function ModeSwitcher() {
  const { theme, setTheme } = useTheme()
  const nextTheme = CYCLE[theme]

  const cycleTheme = useCallback(() => {
    setTheme(nextTheme)
  }, [nextTheme, setTheme])

  return (
    <Button
      variant="ghost"
      size="icon"
      className="group/toggle h-8 w-8 px-0"
      aria-label={`Toggle theme: ${theme} selected; switch to ${nextTheme}`}
      suppressHydrationWarning
      onClick={cycleTheme}
    >
      <SunIcon className="hidden [html[data-theme=light]_&]:block" />
      <MoonIcon className="hidden [html[data-theme=dark]_&]:block" />
      <MonitorIcon className="hidden [html[data-theme=system]_&]:block" />
    </Button>
  )
}
