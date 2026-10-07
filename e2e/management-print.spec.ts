import { expect, test } from '@playwright/test';
import { openPage } from './helpers';

/** 計算 PDF 頁數。 */
function pageCount(pdf: Buffer): number {
  return (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) ?? []).length;
}

test.describe('主管呈報列印（SC-004、NFR-005）', () => {
  test.skip(
    ({ browserName, isMobile }) => browserName !== 'chromium' || isMobile,
    'PDF 僅在桌機 Chromium 產生'
  );

  test('專案報告：A4、每頁 2 個專案、只輸出報告頁', async ({ page }) => {
    await openPage(page, '/management');
    const projects = await page
      .getByRole('switch', { name: /納入呈報/ })
      .count();
    await page
      .getByRole('switch', { name: /納入呈報/ })
      .first()
      .click();
    await page.getByRole('button', { name: '預覽報告' }).first().click();
    const handle = page.getByRole('button', { name: /^移動/ }).first();
    const firstName = (await handle.getAttribute('aria-label'))!.replace(
      '移動',
      ''
    );
    await handle.focus();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('status')).toContainText(
      `${firstName}已移至第 2 位`
    );

    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('header.app-topbar')).toBeHidden();
    await expect(
      page.getByRole('button', { name: '列印／另存 PDF' })
    ).toBeHidden();
    await expect(
      page.getByRole('button', { name: /^移動/ }).first()
    ).toBeHidden();
    const pdf = await page.pdf({ format: 'A4' });
    expect(pageCount(pdf)).toBe(Math.ceil((projects - 1) / 2));
  });

  test('逐案報告：每頁 3 件', async ({ page }) => {
    await openPage(page, '/management');
    await page.getByRole('tab', { name: '逐案呈報' }).click();
    const switches = page.getByRole('switch', { name: /^將.*納入呈報$/ });
    for (let i = 0; i < 4; i += 1) await switches.nth(i).click();
    await page.getByRole('button', { name: '檢視呈報內容' }).click();
    await expect(page.getByRole('region', { name: /第 \d+ 頁/ })).toHaveCount(
      2
    );
    await page.emulateMedia({ media: 'print' });
    await expect(page.getByRole('list', { name: '呈報順序' })).toBeHidden();
    expect(pageCount(await page.pdf({ format: 'A4' }))).toBe(2);
  });
});
