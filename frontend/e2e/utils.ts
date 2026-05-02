import { Page, expect } from '@playwright/test'

export const BACKEND_URL = process.env.BACKEND_URL || 'https://hunt-x-production-2954.up.railway.app'

export function captureErrors(page: Page, errors: { console: string[]; network: string[] }) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.console.push(`[console.error] ${msg.text()}`)
    }
  })
  page.on('pageerror', (err) => {
    errors.console.push(`[pageerror] ${err.message}`)
  })
  page.on('requestfailed', (req) => {
    const errorText = req.failure()?.errorText || ''
    if (!errorText.includes('ERR_ABORTED')) {
      errors.network.push(`[network] ${req.method()} ${req.url()} - ${errorText}`)
    }
  })
}

export async function registerUser(page: Page, email: string, password: string, name: string) {
  await page.goto('/auth')
  await page.waitForSelector('input[type="email"]', { timeout: 10000 })
  // Fill name (if on signup tab)
  const nameInput = page.locator('input[type="text"]').first()
  if (await nameInput.count() > 0 && await nameInput.isVisible()) {
    await nameInput.fill(name)
  }
  await page.locator('input[type="email"]').fill(email)
  await page.locator('input[type="password"]').fill(password)
  await page.locator('form button[type="submit"]').click()
  await page.waitForURL(/\/(auth\/verify|dashboard)/, { timeout: 15000 })
}

export async function loginUser(page: Page, email: string, password: string) {
  await page.goto('/auth')
  await page.waitForSelector('input[type="email"]', { timeout: 10000 })
  await page.locator('input[type="email"]').fill(email)
  await page.locator('input[type="password"]').fill(password)
  await page.getByRole('button', { name: /sign in|login/i }).click()
  await page.waitForURL('/dashboard', { timeout: 15000 })
}

export function uniqueEmail(prefix: string = 'test') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}@example.com`
}

export async function waitForToast(page: Page, text: string | RegExp) {
  await page.waitForSelector(`text=${text}`, { timeout: 10000 })
}

export async function elementExists(page: Page, selector: string) {
  return (await page.locator(selector).count()) > 0
}
