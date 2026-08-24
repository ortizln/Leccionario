# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: login.spec.ts >> Login flow >> shows error with wrong credentials
- Location: e2e\login.spec.ts:14:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[formControlName="username"]')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - heading "404 Not Found" [level=1] [ref=e3]
  - separator [ref=e4]
  - generic [ref=e5]: nginx
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | const USERNAME = process.env.E2E_USERNAME || 'admin';
  4  | const PASSWORD = process.env.E2E_PASSWORD || 'Admin123*';
  5  | 
  6  | test.describe('Login flow', () => {
  7  |   test('shows login form', async ({ page }) => {
  8  |     await page.goto('/login');
  9  |     await expect(page.locator('input[formControlName="username"]')).toBeVisible();
  10 |     await expect(page.locator('input[formControlName="password"]')).toBeVisible();
  11 |     await expect(page.locator('button[type="submit"]')).toBeVisible();
  12 |   });
  13 | 
  14 |   test('shows error with wrong credentials', async ({ page }) => {
  15 |     await page.goto('/login');
> 16 |     await page.fill('input[formControlName="username"]', 'admin');
     |                ^ Error: page.fill: Test timeout of 30000ms exceeded.
  17 |     await page.fill('input[formControlName="password"]', 'wrongpassword');
  18 |     await page.click('button[type="submit"]');
  19 |     await expect(page.locator('.alert-danger')).toBeVisible({ timeout: 10000 });
  20 |   });
  21 | 
  22 |   test('logs in and redirects to authenticated area', async ({ page }) => {
  23 |     await page.goto('/login');
  24 |     await page.fill('input[formControlName="username"]', USERNAME);
  25 |     await page.fill('input[formControlName="password"]', PASSWORD);
  26 |     await page.click('button[type="submit"]');
  27 | 
  28 |     await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });
  29 |     await expect(page).toHaveURL(/\/app/);
  30 |   });
  31 | });
  32 | 
```