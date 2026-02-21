import { test, expect } from '@playwright/test'

test.describe.serial('Authentication Flow', () => {
  const testEmail = `test-${Date.now()}@example.com`
  const testPassword = 'TestPassword123!'

  test('should display landing page', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('Build Your SaaS')
  })

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Log in' }).first().click()
    await expect(page).toHaveURL('/login')
    await expect(page.locator('h1')).toContainText('Welcome back')
  })

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Get Started' }).first().click()
    await expect(page).toHaveURL('/register')
    await expect(page.locator('h1')).toContainText('Create an account')
  })

  test('should register a new account', async ({ page }) => {
    await page.goto('/register')

    await page.getByLabel('Email').fill(testEmail)
    await page.getByLabel('Password', { exact: true }).fill(testPassword)
    await page.getByLabel('Confirm password').fill(testPassword)
    await page.getByRole('button', { name: 'Create account' }).click()

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 })
    await expect(page.getByTestId('app-sidebar')).toBeVisible()
  })

  test('should logout', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.getByLabel('Email').fill(testEmail)
    await page.getByLabel('Password').fill(testPassword)
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 })

    // Open user menu and click logout
    await page.getByTestId('nav-user-trigger').click()
    await page.getByTestId('logout-button').click()

    // Should redirect to landing page
    await expect(page).toHaveURL('/', { timeout: 10000 })
  })

  test('should redirect to login when accessing dashboard unauthenticated', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 })
  })

  test('should login with existing account', async ({ page }) => {
    await page.goto('/login')

    await page.getByLabel('Email').fill(testEmail)
    await page.getByLabel('Password').fill(testPassword)
    await page.getByRole('button', { name: 'Sign in' }).click()

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 })
    await expect(page.getByTestId('app-sidebar')).toBeVisible()
  })
})
