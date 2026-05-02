import { test, expect } from '@playwright/test'
import { captureErrors } from './utils'

test.describe('My Documents', () => {
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

  test('documents page loads', async ({ page }) => {
    await page.goto('/documents')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=/document|my documents|job evaluation/i').first()).toBeVisible()
  })

  test('settings page loads', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=/setting|profile|account/i').first()).toBeVisible()
  })

  test('profile page loads', async ({ page }) => {
    await page.goto('/profile')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=/profile|target roles|preferences/i').first()).toBeVisible()
  })
})
