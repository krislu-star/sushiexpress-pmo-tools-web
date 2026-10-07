import { expect, test, type Page } from '@playwright/test';
import { openPage } from './helpers';

const LONG_TITLE = `ITS260127002, ZRMM0005 功能新增 優化：${'單筆調撥單撿貨改為可多筆單據同時撿貨，新增交貨日期篩選欄位與轉入工廠篩選欄位。'.repeat(8)}`;
const TITLE = 'POS優化';

/** 將表格中的案件名稱換成長文，回傳名稱欄寬與名稱是否折行。 */
async function measureLongTitle(page: Page) {
  const title = page.locator('table').getByText(TITLE, { exact: true }).first();
  await expect(title).toBeVisible();
  return title.evaluate((el, text) => {
    el.textContent = text;
    const cell = el.closest('td')!;
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || 24;
    return {
      width: cell.getBoundingClientRect().width,
      wrapped: el.getBoundingClientRect().height > lineHeight * 1.5,
    };
  }, LONG_TITLE);
}

test.describe('長案件名稱不撐寬表格（spec 001 FR-018）', () => {
  test.beforeEach(async ({ page, isMobile }) => {
    test.skip(isMobile, '欄寬於桌機驗證');
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test('案件追蹤', async ({ page }) => {
    await openPage(page, '/tracker');
    const result = await measureLongTitle(page);
    expect(result.width).toBeLessThanOrEqual(480);
    expect(result.wrapped).toBe(true);
  });

  test('管理層呈報：逐案呈報', async ({ page }) => {
    await openPage(page, '/management');
    await page.getByRole('tab', { name: '逐案呈報' }).click();
    const result = await measureLongTitle(page);
    expect(result.width).toBeLessThanOrEqual(480);
    expect(result.wrapped).toBe(true);
  });

  test('IT 內部會議', async ({ page }) => {
    await openPage(page, '/meeting');
    const result = await measureLongTitle(page);
    expect(result.width).toBeLessThanOrEqual(480);
    expect(result.wrapped).toBe(true);
  });
});
