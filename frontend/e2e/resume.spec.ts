import { test, expect } from '@playwright/test'
import { captureErrors } from './utils'

test.describe('Resume & Evaluation', () => {
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

  test('upload resume page loads', async ({ page }) => {
    await page.goto('/upload')
    await expect(page.locator('text=/upload|resume|drop/i').first()).toBeVisible()
    expect(errors.network.filter(e => !e.includes('favicon'))).toHaveLength(0)
  })

  test('dashboard shows user info', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    // Should show welcome message or user name
    await expect(page.locator('body')).toContainText(/welcome|dashboard|hunt-x/i)
  })

  test('evaluate job page loads', async ({ page }) => {
    await page.goto('/generate')
    await expect(page.locator('text=/evaluate|job|generate/i').first()).toBeVisible()
  })
})
