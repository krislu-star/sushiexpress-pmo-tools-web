import { expect, test } from '@playwright/test';
import { openPage } from './helpers';

// 以預設設定（未開啟會議編輯）建置的產物驗證唯讀；由 build:e2e:readonly 產生 out-e2e-readonly
test.skip(
  !process.env.PMO_E2E_READONLY,
  '僅在 PMO_E2E_READONLY=1（唯讀建置）時執行'
);

test('預設建置的會議頁為唯讀（spec 002 SC-009）', async ({ page }) => {
  await openPage(page, '/meeting');
  await expect(
    page.getByRole('heading', { level: 1, name: 'IT 內部會議' })
  ).toBeVisible();
  await expect(page.getByRole('button', { name: /^修改.*燈號$/ })).toHaveCount(
    0
  );
  await expect(
    page.getByRole('button', { name: '更新', exact: true })
  ).toHaveCount(0);
  await expect(page.getByRole('note')).toContainText('唯讀');
});
