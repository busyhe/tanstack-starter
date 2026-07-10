import { defineConfig, loadEnv } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { nitro } from 'nitro/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { parseClientEnv } from './src/env-schema'
import { sitemapPages } from './src/config/sitemap'

const config = defineConfig(({ command, mode }) => {
  const processClientEnv = Object.fromEntries(Object.entries(process.env).filter(([name]) => name.startsWith('VITE_')))
  const env = parseClientEnv({ ...loadEnv(mode, process.cwd(), 'VITE_'), ...processClientEnv }, command === 'build')

  return {
    plugins: [
      devtools(),
      tailwindcss(),
      tanstackStart({
        pages: sitemapPages,
        sitemap: { host: env.VITE_SITE_URL },
      }),
      nitro(),
      viteReact(),
    ],
    resolve: {
      tsconfigPaths: true,
    },
  }
})

export default config
