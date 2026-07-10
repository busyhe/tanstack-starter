import { constants } from 'node:fs'
import { access } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const serverEntry = new URL('../apps/www/.output/server/index.mjs', import.meta.url)

try {
  await access(fileURLToPath(serverEntry), constants.R_OK)
} catch {
  console.error('Production output is missing. Run `pnpm build` before `pnpm start`.')
  process.exit(1)
}

process.env.NODE_ENV = 'production'
await import(serverEntry.href)
