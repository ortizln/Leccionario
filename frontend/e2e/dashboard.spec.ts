import { test, expect } from '@playwright/test';

const USERNAME = process.env.E2E_USERNAME || 'admin';
const PASSWORD = process.env.E2E_PASSWORD || 'Admin123*';

test.describe('Dashboard & Modules (admin)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[formControlName="username"]', USERNAME);
    await page.fill('input[formControlName="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/app/, { timeout: 15000 });
  });

  test('sidebar shows all main modules for admin', async ({ page }) => {
    const sidebar = page.locator('aside.app-sidebar');
    await expect(sidebar).toBeVisible();

    const expectedModules = [
      'Dashboard',
      'Gestion Academica',
      'Evaluacion',
      'Leccionario',
      'Institucional',
      'Recursos Humanos',
      'Gestion Estudiantil',
      'Gestion Financiera',
      'Inventario y Biblioteca',
      'Business Intelligence',
      'Comunicacion',
      'Inteligencia Artificial',
      'Sistema',
    ];

    for (const moduleName of expectedModules) {
      await expect(sidebar.getByText(moduleName, { exact: false }).first()).toBeVisible();
    }
  });

  test('user info displays correctly', async ({ page }) => {
    const sidebar = page.locator('aside.app-sidebar');
    await expect(sidebar.locator('.user-name')).toBeVisible();
    const name = await sidebar.locator('.user-name').textContent();
    expect(name?.trim().length).toBeGreaterThan(0);
  });

  test('can navigate to Users module', async ({ page }) => {
    await page.click('text=Sistema');
    await page.click('a[href*="/users"]');
    await expect(page).toHaveURL(/\/app\/users/);
  });

  test('can navigate to Academic module', async ({ page }) => {
    await page.click('text=Gestion Academica');
    await page.click('a[href*="/academic/courses"]');
    await expect(page).toHaveURL(/\/app\/academic\/courses/);
  });

  test('can expand and collapse sidebar groups', async ({ page }) => {
    const systemSection = page.locator('text=Sistema').first();
    await systemSection.click();
    await expect(page.locator('a[href*="/audit"]')).toBeVisible();

    await systemSection.click();
    await expect(page.locator('a[href*="/audit"]')).not.toBeVisible();
  });

  test('logout returns to login page', async ({ page }) => {
    await page.click('text=Cerrar sesion');
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });
});
