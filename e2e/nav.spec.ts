import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { openPage } from './helpers';

test.describe('頁首導覽（spec 002 FR-018、SC-013）', () => {
  test('從案件追蹤頁點導覽依序切到另外兩頁，不需重輸密碼', async ({ page }) => {
    await openPage(page, '/tracker');
    const nav = page.getByRole('navigation', { name: '頁面' });
    await expect(
      nav.getByRole('link', { name: 'IT 案件追蹤' })
    ).toHaveAttribute('aria-current', 'page');
    for (const [name, path, heading] of [
      ['管理層呈報', '/management', '主管專案面板'],
      ['IT 內部會議', '/meeting', 'IT 內部會議'],
    ]) {
      await nav.getByRole('link', { name, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`${path}$`));
      await expect(
        page.getByRole('heading', { level: 1, name: heading })
      ).toBeVisible();
      await expect(page.getByLabel('存取密碼')).toHaveCount(0);
      await expect(
        nav.getByRole('link', { name, exact: true })
      ).toHaveAttribute('aria-current', 'page');
    }
    const results = await new AxeBuilder({ page })
      .include('header.app-topbar')
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
