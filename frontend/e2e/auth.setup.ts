import { test as setup } from '@playwright/test'
import { uniqueEmail } from './utils'

const authFile = 'e2e/.auth/user.json'

setup('authenticate', async ({ page }) => {
  const email = uniqueEmail('e2e')
  const password = 'TestPass123!'

  await page.goto('/auth')
  await page.waitForSelector('input[type="email"]', { timeout: 10000 })

  // Switch to signup tab if needed
  const signupTab = page.getByRole('button', { name: /sign up|register/i })
  if (await signupTab.count() > 0) {
    await signupTab.click()
  }

  // Fill signup form
  await page.locator('input[type="text"]').first().fill('E2E Test User')
  await page.locator('input[type="email"]').fill(email)
  await page.locator('input[type="password"]').fill(password)
  await page.locator('form button[type="submit"]').click()

  await page.waitForURL(/\/(auth\/verify|dashboard)/, { timeout: 15000 })

  // Save auth state
  await page.context().storageState({ path: authFile })
})
