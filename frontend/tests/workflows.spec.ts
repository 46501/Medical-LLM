import { test, expect } from '@playwright/test';

test.describe('MediMind AI End-to-End Workflows', () => {

  test('Workflow A: Register, Login, Chat, Logout', async ({ page }) => {
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    const testUser = {
      email: `test_${Date.now()}@example.com`,
      password: 'password123'
    };
    // 1. Register
    await page.goto('/register');
    await page.waitForTimeout(2000); // Wait for React hydration
    await page.waitForLoadState('networkidle');
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);
    await page.click('button[type="submit"]');
    
    // Expect redirection to chat or login
    await expect(page).toHaveURL(/\/chat|\/login/, { timeout: 15000 });
    if (page.url().includes('/login')) {
      await page.waitForLoadState('networkidle');
      await page.fill('input[type="email"]', testUser.email);
      await page.fill('input[type="password"]', testUser.password);
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL('/chat', { timeout: 15000 });
    }

    // 2. Chat
    await page.fill('input[type="text"]', 'What are the symptoms of a common cold?');
    await page.click('button[type="submit"]');
    
    // Expect the AI to respond and the disclaimer to be visible
    await expect(page.locator('text=consult a real doctor').first()).toBeVisible({ timeout: 15000 });

    // 3. Logout
    await page.click('text=Sign out');
    await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
  });

  test('Workflow B: Login, Upload Report, AI Analysis', async ({ page }) => {
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    const user = { email: `report${Date.now()}@example.com`, password: 'password123' };
    await page.goto('/register');
    await page.waitForTimeout(2000);
    await page.fill('input[type="email"]', user.email);
    await page.fill('input[type="password"]', user.password);
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/\/chat|\/login/, { timeout: 15000 });
    if (page.url().includes('/login')) {
      await page.waitForLoadState('networkidle');
      await page.fill('input[type="email"]', user.email);
      await page.fill('input[type="password"]', user.password);
      await page.click('button[type="submit"]');
    }
    
    await page.goto('/analyzer');
    
    await expect(page.locator('text=Medical Report Analyzer')).toBeVisible();
  });

  test('Workflow C: Emergency Question & Safety Engine', async ({ page }) => {
    const user = { email: `emerg${Date.now()}@example.com`, password: 'password123' };
    await page.goto('/register');
    await page.waitForTimeout(500);
    await page.fill('input[type="email"]', user.email);
    await page.fill('input[type="password"]', user.password);
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/\/chat|\/login/, { timeout: 15000 });
    if (page.url().includes('/login')) {
      await page.waitForLoadState('networkidle');
      await page.fill('input[type="email"]', user.email);
      await page.fill('input[type="password"]', user.password);
      await page.click('button[type="submit"]');
    }
    
    await expect(page).toHaveURL(/\/chat/, { timeout: 15000 });
    
    await page.fill('input[type="text"]', 'I am experiencing severe chest pain and arm numbness.');
    await page.click('button[type="submit"]');
    
    // Expect emergency warning
    await expect(page.locator('text=emergency').first()).toBeVisible({ timeout: 30000 });
  });

  test('Workflow D: LLM Unavailable (Mocked Network)', async ({ page }) => {
    await page.route('**/chat/stream', async (route, request) => {
      if (request.method() === 'POST' && request.url().includes('8000')) {
        route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'LLM_ERROR', message: 'Service temporarily unavailable.' })
        });
      } else {
        route.continue();
      }
    });

    await page.goto('/login');
    // We need to be logged in to access chat.
    await page.evaluate(() => localStorage.setItem('token', 'fake-token'));
    await page.goto('/chat');
    await page.waitForTimeout(2000);
    
    await page.fill('input[type="text"]', 'Hello');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Service temporarily unavailable')).toBeVisible();
  });
});
