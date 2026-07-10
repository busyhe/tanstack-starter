import { expect, test } from '@playwright/test'

test('renders SSR data and hydrates without page errors', async ({ page }) => {
  const pageErrors: Error[] = []
  const consoleErrors: string[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })

  const response = await page.goto('/')

  expect(response?.status()).toBe(200)
  await expect(page.locator('p').filter({ hasText: 'API health: ok' })).toBeVisible()
  await page.getByRole('button', { name: /toggle theme/i }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  expect(pageErrors).toEqual([])
  expect(consoleErrors).toEqual([])
})

test('exposes readiness with security headers', async ({ request }) => {
  const response = await request.get('/api/health/ready')

  expect(response.status()).toBe(200)
  expect(response.headers()['cache-control']).toBe('no-store')
  expect(response.headers()['x-robots-tag']).toBe('noindex')
  expect(response.headers()['x-request-id']).toBeTruthy()
  expect(response.headers()['content-security-policy']).toContain("script-src 'self' 'nonce-")
  expect(response.headers()['content-security-policy']).not.toContain("'unsafe-inline'")
  await expect(response.json()).resolves.toMatchObject({
    status: 'ok',
    version: 'e2e',
    kind: 'readiness',
    checks: { application: 'ok' },
  })
})

test('returns a real 404 page', async ({ page }) => {
  const response = await page.goto('/missing')

  expect(response?.status()).toBe(404)
  expect(response?.headers()['x-robots-tag']).toBe('noindex')
  await expect(page.getByRole('heading', { name: 'Page Not Found' })).toBeVisible()
})
