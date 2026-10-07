import { expect, test } from '@playwright/test';
import { openPage } from './helpers';

test('搜尋案件並開啟詳細內容與原表連結（SC-001）', async ({ page }) => {
  await openPage(page, '/tracker');
  const rows = page.locator('tbody tr');
  const total = await rows.count();
  await page.getByRole('searchbox', { name: '搜尋案件' }).fill('POS');
  await expect(rows).not.toHaveCount(total);
  await page.getByRole('button', { name: 'POS優化', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'POS優化' });
  await expect(dialog).toContainText('Frontend 原表 · 來源列 2');
  await expect(
    dialog.getByRole('link', { name: /查看原始工作表/ })
  ).toHaveAttribute('href', /range=D2:M2/);
  await page.keyboard.press('Escape');
  await expect(
    page.getByRole('button', { name: 'POS優化', exact: true })
  ).toBeFocused();
});

test('查無結果顯示空狀態並可清除（SC-003）', async ({ page }) => {
  await openPage(page, '/tracker');
  await page
    .getByRole('searchbox', { name: '搜尋案件' })
    .fill('不存在的關鍵字xyz');
  await expect(
    page.getByRole('heading', { name: '找不到符合條件的案件' })
  ).toBeVisible();
  await page.getByRole('button', { name: '清除篩選' }).click();
  await expect(page.locator('tbody tr').first()).toBeVisible();
});

test('完成度取自原表 Progress：有值顯示百分比與進度條，空白顯示未提供（SC-010）', async ({
  page,
}) => {
  await openPage(page, '/tracker');
  const pos = page.locator('tbody tr', { hasText: 'POS優化' });
  await expect(pos).toContainText('65%');
  await expect(
    pos.getByRole('progressbar', { name: 'POS優化完成進度' })
  ).toHaveAttribute('aria-valuenow', '65');
  const mt = page.locator('tbody tr', { hasText: 'MT候位更換' });
  await expect(mt).toContainText('未提供');
  await expect(mt.getByRole('progressbar')).toHaveCount(0);
});
