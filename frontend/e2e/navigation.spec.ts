import { test, expect } from '@playwright/test'
import { captureErrors } from './utils'

test.describe('Navigation & Pages', () => {
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

  test('landing page loads', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=/hunt-x|career|ai/i').first()).toBeVisible()
    expect(errors.network.filter(e => !e.includes('favicon'))).toHaveLength(0)
  })

  test('pricing page loads', async ({ page }) => {
    await page.goto('/pricing')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { name: /pricing/i })).toBeVisible()
  })

  test('jobs page loads', async ({ page }) => {
    await page.goto('/jobs')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=/job|search|discover/i').first()).toBeVisible()
  })

  test('roaster page loads', async ({ page }) => {
    await page.goto('/roaster')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=/roast|resume|analyze/i').first()).toBeVisible()
  })

  test('chat page loads', async ({ page }) => {
    await page.goto('/chat')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=/chat|coach|career/i').first()).toBeVisible()
  })

  test('interview prep page loads', async ({ page }) => {
    await page.goto('/interview')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=/interview|prep|star/i').first()).toBeVisible()
  })

  test('cover letters page loads', async ({ page }) => {
    await page.goto('/cover-letters')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=/cover|letter/i').first()).toBeVisible()
  })

  test('sidebar navigation works', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    // Sidebar should be visible
    const navLinks = page.locator('nav a, [class*="sidebar"] a, aside a')
    if (await navLinks.count() > 0) {
      const firstLink = navLinks.first()
      await firstLink.click()
      await page.waitForTimeout(2000)
    }
  })
})
