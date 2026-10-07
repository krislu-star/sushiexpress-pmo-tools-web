import { expect, test } from '@playwright/test';
import { openPage } from './helpers';

/** 在頁面內輸入搜尋字並量測到表格更新的時間（毫秒）。 */
async function searchLatency(
  page: import('@playwright/test').Page,
  label: string,
  text: string
) {
  return page.evaluate(
    ({ label, text }) =>
      new Promise<number>(resolve => {
        const input = document.querySelector<HTMLInputElement>(
          `input[aria-label="${label}"]`
        )!;
        const body = document.querySelector('tbody')!;
        const observer = new MutationObserver(() => {
          observer.disconnect();
          resolve(performance.now() - start);
        });
        observer.observe(body, { childList: true, subtree: true });
        const setter = Object.getOwnPropertyDescriptor(
          HTMLInputElement.prototype,
          'value'
        )!.set!;
        const start = performance.now();
        setter.call(input, text);
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }),
    { label, text }
  );
}

const pages = [
  { path: '/tracker', search: '搜尋案件' },
  { path: '/meeting', search: '搜尋會議案件' },
];

for (const { path, search } of pages) {
  test(`${path}：500 件快照 2 秒內可操作、搜尋 100ms 內更新（NFR-001）`, async ({
    page,
  }) => {
    // 效能自輸入密碼後起算（plan 002 第 7 節）：先解鎖一次，再以本分頁金鑰重新開啟並計時
    await openPage(page, path);
    const start = Date.now();
    await page.goto(path);
    await expect(page.getByRole('searchbox', { name: search })).toBeEditable();
    await expect(page.locator('tbody tr').first()).toBeVisible();
    expect(Date.now() - start).toBeLessThan(2000);
    await expect(page.locator('tbody tr')).toHaveCount(500);
    expect(await searchLatency(page, search, '合成案件 12')).toBeLessThan(100);
  });
}

test('/management：500 件彙整後 2 秒內可操作', async ({ page }) => {
  await openPage(page, '/management');
  const start = Date.now();
  await page.goto('/management');
  await expect(
    page.getByRole('button', { name: '預覽報告' }).first()
  ).toBeEnabled();
  expect(Date.now() - start).toBeLessThan(2000);
});
