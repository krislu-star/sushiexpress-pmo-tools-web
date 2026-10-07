import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { E2E_PASSWORD, openPage } from './helpers';

const SECRETS = ['POS優化', 'StevenC', '統智', '供應商平台'];

test.describe('存取保護（spec US-003、US-004）', () => {
  test('未輸入密碼時，畫面與所有網路回應都沒有案件資料（SC-006）', async ({
    page,
  }) => {
    const bodies: string[] = [];
    page.on('response', async response => {
      bodies.push(await response.text().catch(() => ''));
    });
    await page.goto('/tracker');
    await expect(
      page.getByRole('heading', { name: '請輸入存取密碼' })
    ).toBeVisible();
    const html = await page.content();
    for (const secret of SECRETS) {
      expect(html).not.toContain(secret);
      expect(bodies.some(b => b.includes(secret))).toBe(false);
    }
  });

  test('密碼錯誤顯示提示，不顯示內容（SC-008）', async ({ page }) => {
    await page.goto('/meeting');
    await page.getByLabel('存取密碼').fill('wrong-password');
    await page.getByRole('button', { name: '開啟' }).click();
    // Next.js 的路由播報區也是 role=alert，以文字篩選
    await expect(
      page.getByRole('alert').filter({ hasText: '密碼不正確' })
    ).toBeVisible();
    await expect(page.locator('header.app-topbar')).toHaveCount(0);
  });

  test('正確密碼後可切換三頁不需重輸；新的瀏覽器工作階段需重新輸入（SC-007）', async ({
    page,
    browser,
  }) => {
    await openPage(page, '/tracker');
    await expect(
      page.getByRole('heading', { level: 1, name: 'IT 案件追蹤' })
    ).toBeVisible();
    for (const [path, heading] of [
      ['/management', '主管專案面板'],
      ['/meeting', 'IT 內部會議'],
    ]) {
      await page.goto(path);
      await expect(
        page.getByRole('heading', { level: 1, name: heading })
      ).toBeVisible();
      await expect(page.getByLabel('存取密碼')).toHaveCount(0);
    }
    const fresh = await browser.newPage();
    await fresh.goto('/tracker');
    await expect(fresh.getByLabel('存取密碼')).toBeVisible();
    await fresh.close();
  });

  test('密碼畫面無嚴重無障礙問題，可用鍵盤送出', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/tracker');
    await expect(page.getByLabel('存取密碼')).toBeFocused();
    const { violations } = await new AxeBuilder({ page }).analyze();
    expect(
      violations
        .filter(v => ['serious', 'critical'].includes(v.impact ?? ''))
        .map(v => v.id)
    ).toEqual([]);
    await page.keyboard.type(E2E_PASSWORD);
    await page.keyboard.press('Enter');
    await expect(page.locator('header.app-topbar')).toBeVisible();
  });
});
