import { expect, test, type Page } from '@playwright/test';
import { openPage } from './helpers';

async function markRed(page: Page, title: string) {
  await page.getByRole('button', { name: `修改${title}燈號` }).click();
  const dialog = page.getByRole('dialog', { name: '更新會議追蹤' });
  await dialog.getByRole('combobox', { name: '人工燈號' }).click();
  await page.getByRole('option', { name: '🔴 紅燈' }).click();
  await dialog
    .getByRole('textbox', { name: '風險／需要協助' })
    .fill('廠商未回覆');
  await dialog.getByRole('button', { name: '儲存' }).click();
}

test('初始燈號取自原表（SC-010）', async ({ page }) => {
  await openPage(page, '/meeting');
  const stat = (name: RegExp) => page.getByRole('button', { name }).first();
  await expect(stat(/紅燈/)).toContainText('2');
  await expect(stat(/黃燈/)).toContainText('2');
  await expect(stat(/綠燈/)).toContainText('5');
  await expect(stat(/待評估/)).toContainText('7');
  await expect(page.locator('tbody tr').first()).toContainText('紅燈');
});

test('儲存後重新整理仍保留並標示本機修改（SC-007）', async ({ page }) => {
  await openPage(page, '/meeting');
  await markRed(page, '憑證');
  const row = page.locator('tbody tr', {
    has: page.getByRole('cell', { name: '憑證', exact: true }),
  });
  await expect(row).toContainText('本機修改');
  await expect(page.getByRole('status')).toContainText('未回寫工作表');
  await page.reload();
  await expect(row).toContainText('廠商未回覆');
  await expect(row).toContainText('🔴 紅燈');
  await expect(
    page.getByRole('button', { name: /紅燈/ }).first()
  ).toContainText('3');
});

test('本機儲存被封鎖時提示且頁面仍可操作（SC-008）', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('blocked', 'SecurityError');
    };
  });
  await openPage(page, '/meeting');
  await markRed(page, '憑證');
  await expect(page.getByRole('status')).toContainText('僅保留至離開此頁');
  await expect(
    page.locator('tbody tr', {
      has: page.getByRole('cell', { name: '憑證', exact: true }),
    })
  ).toContainText('🔴 紅燈');
});

test('本機資料損毀時忽略並正常顯示（SC-009）', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'sushi-pmo-meeting-v1',
      JSON.stringify({ 'Project-row-11': { light: 'purple' }, x: 1 })
    );
  });
  await openPage(page, '/meeting');
  await expect(
    page.getByRole('button', { name: /待評估/ }).first()
  ).toBeVisible();
  await expect(page.locator('tbody tr')).not.toHaveCount(0);
});
