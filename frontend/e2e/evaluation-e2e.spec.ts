import { test, expect } from '@playwright/test'
import { uniqueEmail, captureErrors } from './utils'
import path from 'path'
import fs from 'fs'

// Evaluation flow E2E test with real CV
// Usage: npx playwright test e2e/evaluation-e2e.spec.ts --project=chromium

test.describe('Evaluation E2E - Real CV', () => {
  const errors = { console: [] as string[], network: [] as string[] }
  const email = uniqueEmail('eval')
  const password = 'TestPass123!'
  const cvPath = '/Users/tanvir/Downloads/erricson cv Final.pdf'

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

  test('full evaluation flow with real CV', async ({ page }) => {
    test.setTimeout(120000)

    // Verify CV file exists
    expect(fs.existsSync(cvPath)).toBe(true)

    // 1. Register
    await page.goto('/auth')
    await page.waitForSelector('input[type="email"]', { timeout: 10000 })

    const signupTab = page.getByRole('button', { name: /sign up|register/i })
    if (await signupTab.count() > 0) {
      await signupTab.click()
    }

    await page.locator('input[type="text"]').first().fill('Evaluation Test User')
    await page.locator('input[type="email"]').fill(email)
    await page.locator('input[type="password"]').fill(password)
    await page.locator('form button[type="submit"]').click()

    await page.waitForURL(/\/(auth\/verify|dashboard)/, { timeout: 15000 })

    // If email verification required, skip by going to dashboard
    if (page.url().includes('/auth/verify')) {
      await page.goto('/dashboard')
    }
    await page.waitForLoadState('networkidle')

    // 2. Upload CV
    await page.goto('/upload')
    await page.waitForSelector('input[type="email"]', { timeout: 10000 })

    // Fill email if not pre-filled
    const emailInput = page.locator('input[type="email"]')
    if (await emailInput.inputValue() === '') {
      await emailInput.fill(email)
    }

    // Upload file via dropzone
    const fileInput = await page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(cvPath)

    // Wait for upload to complete
    await page.waitForSelector('text=/success|uploaded|skills/i', { timeout: 30000 })

    // Extract resume ID from the page or API response
    const resumeLink = await page.locator('a[href*="/generate"]').first()
    await expect(resumeLink).toBeVisible({ timeout: 15000 })

    // 3. Navigate to evaluate page
    await page.goto('/generate')
    await page.waitForLoadState('networkidle')

    // Select the uploaded resume
    await page.waitForSelector('select, [data-testid="resume-select"], button', { timeout: 10000 })

    // Try to find and select resume
    const resumeSelect = page.locator('select').first()
    if (await resumeSelect.count() > 0) {
      await resumeSelect.selectOption({ index: 0 })
    }

    // Fill job details
    const jobTitle = 'Senior Software Engineer'
    const company = 'TechCorp Inc'
    const jobDescription = `We are looking for a Senior Software Engineer to join our growing team.

Requirements:
- 5+ years of experience in software development
- Proficiency in Python, JavaScript, and cloud technologies
- Experience with AWS, Docker, and Kubernetes
- Strong problem-solving skills and attention to detail
- Bachelor's degree in Computer Science or related field

Responsibilities:
- Design and build scalable backend services
- Lead technical architecture decisions
- Mentor junior engineers
- Collaborate with cross-functional teams
- Write clean, maintainable code with comprehensive tests

We offer competitive salary, remote work options, and a comprehensive benefits package.`

    const titleInput = page.locator('input[placeholder*="title" i], input[name="jobTitle"]').first()
    if (await titleInput.count() > 0) {
      await titleInput.fill(jobTitle)
    }

    const companyInput = page.locator('input[placeholder*="company" i], input[name="company"]').first()
    if (await companyInput.count() > 0) {
      await companyInput.fill(company)
    }

    const descTextarea = page.locator('textarea').first()
    if (await descTextarea.count() > 0) {
      await descTextarea.fill(jobDescription)
    }

    // Submit evaluation
    const evaluateBtn = page.locator('button:has-text("Evaluate"), button:has-text("Analyze"), button[type="submit"]').first()
    await evaluateBtn.click()

    // Wait for evaluation to complete (up to 90s for AI processing)
    await page.waitForSelector('text=/score|recommendation|match|archetype|block/i', { timeout: 90000 })

    // Capture evaluation results
    const pageText = await page.locator('body').innerText()

    // Verify key evaluation components are present
    expect(pageText).toMatch(/score|recommendation|match|archetype|block/i)

    // Attach full page text as test artifact
    await test.info().attach('evaluation-results', { body: pageText, contentType: 'text/plain' })

    // No network errors during evaluation
    const evalErrors = errors.network.filter(e => !e.includes('favicon'))
    expect(evalErrors).toHaveLength(0)
  })
})
