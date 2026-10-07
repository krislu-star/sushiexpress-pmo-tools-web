import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { openPage } from './helpers';

const pages = [
  { path: '/tracker', title: 'IT 案件追蹤', heading: 'IT 案件追蹤' },
  { path: '/management', title: '管理層呈報', heading: '主管專案面板' },
  { path: '/meeting', title: 'IT 內部會議', heading: 'IT 內部會議' },
];

for (const { path, title, heading } of pages) {
  test(`${path} 在禁止行內腳本的 CSP 下可載入且無嚴重無障礙問題`, async ({
    page,
  }) => {
    const cspErrors: string[] = [];
    page.on('console', msg => {
      if (/Content Security Policy/i.test(msg.text()))
        cspErrors.push(msg.text());
    });
    await openPage(page, path);
    await expect(page).toHaveTitle(new RegExp(title));
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);
    expect(cspErrors).toEqual([]);

    const { violations } = await new AxeBuilder({ page }).analyze();
    const serious = violations.filter(v =>
      ['serious', 'critical'].includes(v.impact ?? '')
    );
    expect(serious).toEqual([]);
  });
}
