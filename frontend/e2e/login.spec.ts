import { test, expect } from '@playwright/test';

const USERNAME = process.env.E2E_USERNAME || 'admin';
const PASSWORD = process.env.E2E_PASSWORD || 'Admin123*';

test.describe('Login flow', () => {
  test('shows login form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input[formControlName="username"]')).toBeVisible();
    await expect(page.locator('input[formControlName="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('shows error with wrong credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[formControlName="username"]', 'admin');
    await page.fill('input[formControlName="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await expect(page.locator('.alert-danger')).toBeVisible({ timeout: 10000 });
  });

  test('logs in and redirects to authenticated area', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[formControlName="username"]', USERNAME);
    await page.fill('input[formControlName="password"]', PASSWORD);
    await page.click('button[type="submit"]');

    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });
    await expect(page).toHaveURL(/\/app/);
  });
});
