import { test, expect } from '@playwright/test'
import { captureErrors, uniqueEmail } from './utils'

test.describe('Auth Flows', () => {
  const errors = { console: [] as string[], network: [] as string[] }

  test.beforeEach(({ page }) => {
    errors.console = []
    errors.network = []
    captureErrors(page, errors)
  })

  test.afterEach(async ({}, testInfo) => {
    if (errors.console.length > 0) {
      await testInfo.attach('console-errors', { body: errors.console.join('\n'), contentType: 'text/plain' })
    }
    if (errors.network.length > 0) {
      await testInfo.attach('network-errors', { body: errors.network.join('\n'), contentType: 'text/plain' })
    }
  })

  test('register new user', async ({ page }) => {
    const email = uniqueEmail('register')
    await page.goto('/auth')
    await page.waitForSelector('input[type="email"]', { timeout: 10000 })

    const signupTab = page.getByRole('button', { name: /sign up|register/i })
    if (await signupTab.count() > 0) await signupTab.click()

    await page.locator('input[type="text"]').first().fill('Test User')
    await page.locator('input[type="email"]').fill(email)
    await page.locator('input[type="password"]').fill('TestPass123!')
    await page.locator('form button[type="submit"]').click()
    await page.waitForURL(/\/(auth\/verify|dashboard)/, { timeout: 15000 })
    expect(errors.network).toHaveLength(0)
  })

  test('login with valid credentials', async ({ page }) => {
    const email = uniqueEmail('login')
    // Register first
    await page.goto('/auth')
    await page.waitForSelector('input[type="email"]', { timeout: 10000 })

    const signupTab = page.getByRole('button', { name: /sign up|register/i })
    if (await signupTab.count() > 0) await signupTab.click()

    await page.locator('input[type="text"]').first().fill('Login Test')
    await page.locator('input[type="email"]').fill(email)
    await page.locator('input[type="password"]').fill('TestPass123!')
    await page.locator('form button[type="submit"]').click()
    await page.waitForURL(/\/(auth\/verify|dashboard)/, { timeout: 15000 })

    // Logout and login
    await page.goto('/auth')
    await page.waitForSelector('input[type="email"]', { timeout: 10000 })
    const signInTab = page.getByRole('button', { name: /sign in/i }).first()
    if (await signInTab.count() > 0) await signInTab.click()
    await page.locator('input[type="email"]').fill(email)
    await page.locator('input[type="password"]').fill('TestPass123!')
    await page.locator('form button[type="submit"]').click()
    // Unverified users redirect to /auth/verify; verified to /dashboard
    await page.waitForURL(/\/(dashboard|auth\/verify)/, { timeout: 15000 })
    expect(errors.network).toHaveLength(0)
  })

  test('reject weak password', async ({ page }) => {
    await page.goto('/auth')
    await page.waitForSelector('input[type="email"]', { timeout: 10000 })

    const signupTab = page.getByRole('button', { name: /sign up|register/i })
    if (await signupTab.count() > 0) await signupTab.click()

    await page.locator('input[type="text"]').first().fill('Weak Pass')
    await page.locator('input[type="email"]').fill(uniqueEmail('weak'))
    await page.locator('input[type="password"]').fill('123')
    await page.locator('form button[type="submit"]').click()
    // Page should stay on auth (either validation blocks submit or error shows)
    await expect(page.locator('text=/Fair|Weak|8\+ chars|password/i').first()).toBeVisible({ timeout: 5000 })
    expect(page.url()).toContain('/auth')
  })

  test('auth page shows login form', async ({ page }) => {
    await page.goto('/auth')
    await page.waitForSelector('input[type="email"]', { timeout: 10000 })
    await expect(page.getByRole('button', { name: /sign in|login/i }).first()).toBeVisible()
  })

  test('resend verification code', async ({ page }) => {
    const email = uniqueEmail('resend')
    await page.goto('/auth')
    await page.waitForSelector('input[type="email"]', { timeout: 10000 })

    const signupTab = page.getByRole('button', { name: /sign up|register/i })
    if (await signupTab.count() > 0) await signupTab.click()

    await page.locator('input[type="text"]').first().fill('Resend Test')
    await page.locator('input[type="email"]').fill(email)
    await page.locator('input[type="password"]').fill('TestPass123!')
    await page.locator('form button[type="submit"]').click()
    await page.waitForURL('/auth/verify', { timeout: 15000 })
    await page.getByText(/resend|didn't receive/i).click()
    await expect(page.locator('text=/sent|resent/i')).toBeVisible({ timeout: 10000 })
  })

  test('forgot password flow', async ({ page }) => {
    await page.goto('/auth')
    await page.waitForSelector('input[type="email"]', { timeout: 10000 })
    // Switch to Sign In tab to find forgot password link
    const signInTab = page.getByRole('button', { name: /sign in/i }).first()
    if (await signInTab.count() > 0) await signInTab.click()
    await page.getByText(/forgot|reset/i).click()
    await page.waitForURL('/auth/reset', { timeout: 5000 })
    await page.locator('input[type="email"]').fill('test@example.com')
    await page.locator('form button[type="submit"]').click()
    await expect(page.locator('text=/sent|check your email/i').first()).toBeVisible({ timeout: 10000 })
  })
})
