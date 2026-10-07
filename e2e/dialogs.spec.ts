import { expect, test, type Locator, type Page } from '@playwright/test';
import { openPage } from './helpers';

/** 對話框內的文字元素（標題、段落、欄位、按鈕、連結）彼此不交疊，且背景有遮罩。 */
async function expectNoOverlap(page: Page, dialog: Locator) {
  const overlaps = await dialog.evaluate(el => {
    const items = Array.from(
      el.querySelectorAll('h2, h3, p, dt, dd, a, button')
    )
      .filter(
        n =>
          !n.closest('button.absolute') && n.getBoundingClientRect().height > 0
      )
      .map(n => ({
        rect: n.getBoundingClientRect(),
        text: (n.textContent ?? '').slice(0, 16),
        node: n,
      }));
    const found: string[] = [];
    items.forEach((a, i) =>
      items.slice(i + 1).forEach(b => {
        if (a.node.contains(b.node) || b.node.contains(a.node)) return;
        const w =
          Math.min(a.rect.right, b.rect.right) -
          Math.max(a.rect.left, b.rect.left);
        const h =
          Math.min(a.rect.bottom, b.rect.bottom) -
          Math.max(a.rect.top, b.rect.top);
        if (w > 2 && h > 2) found.push(`「${a.text}」與「${b.text}」`);
      })
    );
    return found;
  });
  expect(overlaps).toEqual([]);
  const overlay = page.locator('[data-state="open"].fixed.inset-0').first();
  const background = await overlay.evaluate(
    el => getComputedStyle(el).backgroundColor
  );
  expect(background).not.toBe('rgba(0, 0, 0, 0)');
}

test('關聯案件對話框：內容不重疊、有遮罩、可按關閉鈕關閉', async ({ page }) => {
  await openPage(page, '/management');
  await page
    .getByRole('article', { name: 'BPM｜BPM' })
    .getByRole('button', { name: '關聯案件 4' })
    .click();
  const dialog = page.getByRole('dialog', { name: 'BPM｜BPM' });
  await expect(dialog).toBeVisible();
  await expectNoOverlap(page, dialog);
  await dialog.getByRole('button', { name: '關閉' }).click();
  await expect(dialog).toBeHidden();
});

test('案件詳細對話框：長 LOG 不重疊、可按關閉鈕關閉', async ({ page }) => {
  await openPage(page, '/tracker');
  await page.getByRole('button', { name: 'POS優化', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'POS優化' });
  await expectNoOverlap(page, dialog);
  await dialog.getByRole('button', { name: '關閉' }).click();
  await expect(dialog).toBeHidden();
});
