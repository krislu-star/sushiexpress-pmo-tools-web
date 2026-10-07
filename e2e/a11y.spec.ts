import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { openPage } from './helpers';

// 以「減少動態效果」執行，避免 axe 在對話框淡入動畫途中量到半透明色（頁面依 NFR-002 會停用動畫）
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

/** axe 檢查，不允許 serious／critical。 */
async function expectAccessible(page: Page) {
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(
    violations
      .filter(v => ['serious', 'critical'].includes(v.impact ?? ''))
      .map(v => v.id)
  ).toEqual([]);
}

test('案件詳細對話框（NFR-002）', async ({ page }) => {
  await openPage(page, '/tracker');
  await page.getByRole('button', { name: 'POS優化', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expectAccessible(page);
});

test('主管頁：專案報告預覽與逐案呈報', async ({ page }) => {
  await openPage(page, '/management');
  await page.getByRole('tab', { name: '逐案呈報' }).click();
  await expectAccessible(page);
  await page.getByRole('tab', { name: '專案列表' }).click();
  await page.getByRole('button', { name: '預覽報告' }).first().click();
  await expectAccessible(page);
});

test('會議頁：編輯對話框', async ({ page }) => {
  await openPage(page, '/meeting');
  await page.getByRole('button', { name: '修改憑證燈號' }).click();
  await expect(
    page.getByRole('dialog', { name: '更新會議追蹤' })
  ).toBeVisible();
  await expectAccessible(page);
});

test('全程鍵盤可操作：搜尋、排序、開啟與關閉詳細內容', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, '鍵盤操作於桌機驗證');
  await openPage(page, '/tracker');
  // 頁首順序：三頁導覽（spec 002 FR-018）→ 版本說明
  const nav = page.getByRole('navigation', { name: '頁面' });
  for (const name of ['IT 案件追蹤', '管理層呈報', 'IT 內部會議']) {
    await page.keyboard.press('Tab');
    await expect(nav.getByRole('link', { name, exact: true })).toBeFocused();
  }
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('button', { name: '關於這個版本' })
  ).toBeFocused();
  await page.getByRole('searchbox', { name: '搜尋案件' }).focus();
  await page.keyboard.type('POS');
  await page.getByRole('button', { name: /^案件名稱/ }).focus();
  await page.keyboard.press('Enter');
  await expect(
    page.getByRole('columnheader', { name: /案件名稱/ })
  ).toHaveAttribute('aria-sort', 'ascending');
  await page.getByRole('button', { name: 'POS優化', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
});

for (const path of ['/tracker', '/management', '/meeting']) {
  test(`${path}：390px 寬度無水平捲動（FR-018）`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openPage(page, path);
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
}
