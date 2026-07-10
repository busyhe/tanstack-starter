import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { Button, buttonVariants } from './components/button'

interface Oklch {
  l: number
  c: number
  h: number
}

const css = readFileSync(new URL('./globals.css', import.meta.url), 'utf8')

function parseTheme(selector: ':root' | '.dark') {
  const start = css.indexOf(`${selector} {`)
  const end = css.indexOf('\n}', start)
  if (start === -1 || end === -1) throw new Error(`Could not find ${selector} theme block`)

  const tokens = new Map<string, Oklch>()
  const tokenPattern = /--([\w-]+):\s*oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)/g
  for (const match of css.slice(start, end).matchAll(tokenPattern)) {
    tokens.set(match[1]!, {
      l: Number(match[2]!),
      c: Number(match[3]!),
      h: Number(match[4]!),
    })
  }

  return tokens
}

function toLinearSrgb({ l, c, h }: Oklch) {
  const radians = (h * Math.PI) / 180
  const a = c * Math.cos(radians)
  const b = c * Math.sin(radians)
  const lPrime = l + 0.3963377774 * a + 0.2158037573 * b
  const mPrime = l - 0.1055613458 * a - 0.0638541728 * b
  const sPrime = l - 0.0894841775 * a - 1.291485548 * b
  const lChannel = lPrime ** 3
  const mChannel = mPrime ** 3
  const sChannel = sPrime ** 3

  return [
    4.0767416621 * lChannel - 3.3077115913 * mChannel + 0.2309699292 * sChannel,
    -1.2684380046 * lChannel + 2.6097574011 * mChannel - 0.3413193965 * sChannel,
    -0.0041960863 * lChannel - 0.7034186147 * mChannel + 1.707614701 * sChannel,
  ] as const
}

function contrast(first: Oklch, second: Oklch) {
  const luminance = (color: Oklch) => {
    const [red, green, blue] = toLinearSrgb(color)
    for (const channel of [red, green, blue]) {
      expect(channel).toBeGreaterThanOrEqual(-0.0001)
      expect(channel).toBeLessThanOrEqual(1.0001)
    }
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue
  }

  const firstLuminance = luminance(first)
  const secondLuminance = luminance(second)
  const lighter = Math.max(firstLuminance, secondLuminance)
  const darker = Math.min(firstLuminance, secondLuminance)
  return (lighter + 0.05) / (darker + 0.05)
}

function getToken(tokens: Map<string, Oklch>, name: string) {
  const token = tokens.get(name)
  if (!token) throw new Error(`Missing --${name}`)
  return token
}

describe.each([
  ['light', parseTheme(':root')],
  ['dark', parseTheme('.dark')],
] as const)('%s theme', (_name, tokens) => {
  it.each([
    ['foreground', 'background'],
    ['primary-foreground', 'primary'],
    ['primary', 'background'],
    ['destructive-foreground', 'destructive'],
    ['destructive', 'background'],
    ['muted-foreground', 'muted'],
    ['sidebar-foreground', 'sidebar'],
    ['sidebar-primary-foreground', 'sidebar-primary'],
  ])('%s has readable contrast against %s', (foreground, background) => {
    expect(contrast(getToken(tokens, foreground), getToken(tokens, background))).toBeGreaterThanOrEqual(4.5)
  })

  it('has a visible focus ring', () => {
    expect(contrast(getToken(tokens, 'ring'), getToken(tokens, 'background'))).toBeGreaterThanOrEqual(3)
  })
})

describe('theme contract', () => {
  it('uses valid semantic colors', () => {
    expect(css).not.toContain('hsl(var(--border))')
    expect(css).toContain('@media (prefers-reduced-motion: reduce)')
    expect(parseTheme(':root').has('destructive-foreground')).toBe(true)
    expect(parseTheme('.dark').has('destructive-foreground')).toBe(true)
  })

  it('keeps destructive buttons on semantic tokens', () => {
    const classes = buttonVariants({ variant: 'destructive' })
    expect(classes).toContain('text-destructive-foreground')
    expect(classes).not.toContain('text-white')
    expect(Button({ children: 'Delete' })).toMatchObject({ type: 'button', props: { type: 'button' } })
    expect(Button({ children: 'Delete', type: 'submit' })).toMatchObject({ props: { type: 'submit' } })
  })
})
