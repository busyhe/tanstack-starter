import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://127.0.0.1:3100',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'pnpm start',
    url: 'http://127.0.0.1:3100/api/health/live',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
    env: {
      APP_VERSION: 'e2e',
      HOST: '127.0.0.1',
      NODE_ENV: 'production',
      PORT: '3100',
    },
  },
})
