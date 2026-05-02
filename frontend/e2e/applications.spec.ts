import { test, expect } from '@playwright/test'
import { captureErrors } from './utils'

test.describe('Application Tracker', () => {
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

  test('applications page loads', async ({ page }) => {
    await page.goto('/applications')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=/application|tracker|job/i').first()).toBeVisible()
  })

  test('add application modal opens', async ({ page }) => {
    await page.goto('/applications')
    await page.waitForLoadState('networkidle')
    // Look for add button
    const addBtn = page.locator('button:has-text("+"):visible, button:has-text("Add"):visible, button:has-text("New"):visible').first()
    if (await addBtn.count() > 0) {
      await addBtn.click()
      await expect(page.locator('text=/company|role|stage/i').first()).toBeVisible()
    }
  })
})
