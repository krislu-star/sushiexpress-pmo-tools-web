import { expect, type Page } from '@playwright/test';

/** build:e2e／build:perf 使用的測試密碼（非機密）。 */
export const E2E_PASSWORD = 'e2e-password';

/**
 * 開啟頁面；若出現密碼畫面則以測試密碼解鎖，等到頁面內容出現為止。
 * 同一分頁已解鎖時（sessionStorage 有金鑰）直接進入內容。
 */
export async function openPage(page: Page, path: string) {
  await page.goto(path);
  const password = page.getByLabel('存取密碼');
  const content = page.locator('header.app-topbar');
  await expect(password.or(content)).toBeVisible();
  if (await password.isVisible()) {
    await password.fill(E2E_PASSWORD);
    await page.getByRole('button', { name: '開啟' }).click();
  }
  await expect(content).toBeVisible();
}
