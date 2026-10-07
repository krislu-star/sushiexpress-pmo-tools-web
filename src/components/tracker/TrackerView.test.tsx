import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import sample from '../../../tests/fixtures/snapshot.sample.json';
import { chooseOption } from '../../../tests/select';
import { toCases } from '@/lib/pmo/cases';
import { parseSnapshot } from '@/lib/pmo/snapshotSchema';
import { TrackerView } from './TrackerView';

const cases = toCases(parseSnapshot(sample));
const titles = () =>
  screen
    .getAllByRole('row')
    .slice(1)
    .map(row => within(row).getAllByRole('button')[0].textContent);

function setup() {
  render(<TrackerView cases={cases} capturedAt="2026-09-15" />);
}

describe('TrackerView', () => {
  it('顯示頁面標題、資料說明與全部案件（US-001、US-007）', () => {
    setup();
    expect(
      screen.getByRole('heading', { level: 1, name: 'IT 案件追蹤' })
    ).toBeInTheDocument();
    expect(screen.getByRole('note')).toHaveTextContent('16 件');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      '案件列表16'
    );
    expect(titles()).toHaveLength(16);
    expect(screen.getByText('共 16 件符合條件')).toBeInTheDocument();
  });

  it('搜尋「POS」只顯示相符案件並更新件數（SC-001）', async () => {
    setup();
    await userEvent.type(
      screen.getByRole('searchbox', { name: '搜尋案件' }),
      'POS'
    );
    expect(titles()).toContain('POS優化');
    expect(titles().length).toBeLessThan(16);
    expect(
      screen.getByText(`共 ${titles().length} 件符合條件`)
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '清除搜尋' }));
    expect(titles()).toHaveLength(16);
  });

  it('點案件名稱開啟詳細內容與原表連結（SC-001、US-002）', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: 'POS優化' }));
    const dialog = screen.getByRole('dialog', { name: 'POS優化' });
    expect(dialog).toHaveTextContent('Frontend 原表 · 來源列 2');
    expect(
      within(dialog).getByRole('link', { name: /查看原始工作表/ })
    ).toHaveAttribute(
      'href',
      expect.stringContaining('gid=1752624033&range=D2:M2')
    );
  });

  it('依小組、狀態、專案篩選，重設後恢復（FR-004）', async () => {
    setup();
    await chooseOption('篩選小組', 'SAP');
    expect(titles()).toHaveLength(4);
    await chooseOption('篩選所屬專案', '全部專案');
    await userEvent.click(screen.getByRole('button', { name: '重設' }));
    expect(titles()).toHaveLength(16);
    const status = cases[0].status;
    await chooseOption('篩選狀態', status);
    expect(titles().length).toBe(cases.filter(c => c.status === status).length);
    await userEvent.click(screen.getByRole('button', { name: '重設' }));
    await chooseOption('篩選所屬專案', cases[4].project);
    expect(titles().length).toBe(
      cases.filter(c => c.project === cases[4].project).length
    );
  });

  it('點欄名切換升降冪，顯示目前排序（SC-002）', async () => {
    setup();
    const summary = screen.getByText(/目前排序：/);
    expect(summary).toHaveTextContent('原表順序 · 升冪');
    await userEvent.click(screen.getByRole('button', { name: /案件名稱/ }));
    expect(summary).toHaveTextContent('案件名稱 · 升冪');
    await userEvent.click(screen.getByRole('button', { name: /案件名稱/ }));
    expect(summary).toHaveTextContent('案件名稱 · 降冪');
    expect(
      screen.getByRole('columnheader', { name: /案件名稱/ })
    ).toHaveAttribute('aria-sort', 'descending');
  });

  it('更新日期全為未提供時維持原表順序；可依 BPM 單號排序並回到原表順序', async () => {
    setup();
    const original = titles();
    await userEvent.click(screen.getByRole('button', { name: /更新日期/ }));
    expect(titles()).toEqual(original);
    await userEvent.click(screen.getByRole('button', { name: /BPM 單號/ }));
    expect(screen.getByText(/目前排序：/)).toHaveTextContent('BPM 單號 · 升冪');
    expect(titles()).not.toEqual(original);
    await userEvent.click(screen.getByRole('button', { name: '回到原表順序' }));
    expect(titles()).toEqual(original);
  });

  it('查無結果顯示空狀態，清除篩選後恢復（SC-003）', async () => {
    setup();
    await userEvent.type(
      screen.getByRole('searchbox', { name: '搜尋案件' }),
      '不存在的關鍵字xyz'
    );
    expect(screen.queryByRole('table')).toBeNull();
    expect(
      screen.getByRole('heading', { name: '找不到符合條件的案件' })
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '清除篩選' }));
    expect(titles()).toHaveLength(16);
  });
});
