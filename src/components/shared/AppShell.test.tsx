import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppShell } from './AppShell';

describe('AppShell', () => {
  it('頂欄顯示品牌字、頁面名稱與版本說明入口（FR-002）', () => {
    render(
      <AppShell pageName="IT 案件追蹤" capturedAt="2026-09-15" caseCount={16}>
        內容
      </AppShell>
    );
    const banner = screen.getByRole('banner');
    expect(banner).toHaveTextContent('爭鮮');
    expect(banner).toHaveTextContent('SUSHI EXPRESS');
    expect(banner).toHaveTextContent('IT 案件追蹤');
    expect(screen.getByRole('main')).toHaveTextContent('內容');
    expect(screen.getByRole('contentinfo')).toHaveTextContent(
      '爭鮮 · IT 案件追蹤與管理層呈報'
    );
  });

  it('頁首導覽可切換三頁並標示目前所在頁（spec 002 FR-018）', () => {
    render(
      <AppShell pageName="管理層呈報" capturedAt="2026-09-15" caseCount={16}>
        x
      </AppShell>
    );
    const nav = screen.getByRole('navigation', { name: '頁面' });
    const links = within(nav).getAllByRole('link');
    expect(links.map(a => [a.textContent, a.getAttribute('href')])).toEqual([
      ['IT 案件追蹤', '/tracker'],
      ['管理層呈報', '/management'],
      ['IT 內部會議', '/meeting'],
    ]);
    expect(
      within(nav).getByRole('link', { name: '管理層呈報' })
    ).toHaveAttribute('aria-current', 'page');
    expect(
      within(nav).getByRole('link', { name: 'IT 案件追蹤' })
    ).not.toHaveAttribute('aria-current');
  });

  it('點版本說明開啟「關於這個版本」（US-007）', async () => {
    render(
      <AppShell pageName="IT 內部會議" capturedAt="2026-09-15" caseCount={16}>
        x
      </AppShell>
    );
    await userEvent.click(screen.getByRole('button', { name: '關於這個版本' }));
    const dialog = screen.getByRole('dialog', { name: '關於這個版本' });
    expect(dialog).toHaveTextContent('2026/09/15');
    expect(dialog).toHaveTextContent('16 件');
    expect(dialog).toHaveTextContent('完成度與燈號取自原表');
    expect(dialog).toHaveTextContent('Teams');
    expect(dialog).toHaveTextContent('不會自動同步');
  });
});
