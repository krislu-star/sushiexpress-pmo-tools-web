import { expect, test } from '@playwright/test';

test('根網址轉到案件追蹤頁並要求密碼（spec 002 SC-012）', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/tracker$/);
  await expect(
    page.getByRole('heading', { name: '請輸入存取密碼' })
  ).toBeVisible();
});

test('根頁以 meta refresh 轉址，不含可執行腳本', async ({ request }) => {
  const html = await (await request.get('/')).text();
  expect(html).toMatch(
    /<meta http-equiv="refresh" content="0;\s*url=\/tracker"/
  );
  expect(html).not.toContain('POS優化');
});
