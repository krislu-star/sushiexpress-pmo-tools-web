import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import sample from '../../../tests/fixtures/snapshot.sample.json';
import { chooseOption } from '../../../tests/select';
import { toCases } from '@/lib/pmo/cases';
import { parseSnapshot } from '@/lib/pmo/snapshotSchema';
import { ManagementView } from './ManagementView';

const cases = toCases(parseSnapshot(sample));
const projectNames = () =>
  screen
    .queryAllByRole('article')
    .map(a => within(a).getByRole('heading', { level: 2 }).textContent);

function setup() {
  render(<ManagementView cases={cases} capturedAt="2026-09-15" />);
}

describe('ManagementView：專案列表（US-003）', () => {
  it('依「小組｜原表分類」列出專案，每列顯示狀態、進度紀錄彙整與負責人', () => {
    setup();
    expect(
      screen.getByRole('heading', { level: 1, name: '主管專案面板' })
    ).toBeInTheDocument();
    expect(projectNames()).toHaveLength(9);
    const bpm = screen.getByRole('article', { name: 'BPM｜BPM' });
    expect(bpm).toHaveTextContent('待確認');
    expect(bpm).toHaveTextContent('專案預算申請及簽核單：');
    expect(bpm).toHaveTextContent('關聯案件負責人：昌宏、Reira、Herbert');
    expect(screen.getByRole('note')).toHaveTextContent('9 個分類');
  });

  it('搜尋專案名稱或內容，重設後恢復', async () => {
    setup();
    await userEvent.type(
      screen.getByRole('searchbox', { name: '搜尋專案' }),
      '食品雲'
    );
    expect(projectNames()).toEqual(['Project｜食品雲']);
    await userEvent.click(screen.getByRole('button', { name: '重設' }));
    expect(projectNames()).toHaveLength(9);
  });

  it('狀態篩選選「執行中」時顯示沒有符合條件的專案（FR-010）', async () => {
    setup();
    await chooseOption('篩選專案狀態', '執行中');
    expect(projectNames()).toHaveLength(0);
    expect(screen.getByText('沒有符合條件的專案。')).toBeInTheDocument();
    await chooseOption('篩選專案狀態', '待確認');
    expect(projectNames()).toHaveLength(9);
  });

  it('開啟關聯案件清單，可從案件發起 Teams 說明', async () => {
    setup();
    const bpm = screen.getByRole('article', { name: 'BPM｜BPM' });
    await userEvent.click(
      within(bpm).getByRole('button', { name: '關聯案件 4' })
    );
    const dialog = screen.getByRole('dialog', { name: 'BPM｜BPM' });
    expect(within(dialog).getAllByRole('heading', { level: 3 })).toHaveLength(
      4
    );
    await userEvent.click(
      within(dialog).getByRole('button', { name: /昌宏 · Teams 訊息/ })
    );
    expect(
      screen.getByRole('dialog', { name: '與負責人聯繫' })
    ).toHaveTextContent('專案預算申請及簽核單');
  });

  it('專案的 Teams 聯繫顯示說明且不傳送訊息（SC-006）', async () => {
    setup();
    const sap = screen.getByRole('article', { name: 'SAP｜未分類' });
    await userEvent.click(
      within(sap).getByRole('button', {
        name: '透過 Teams 聯繫SAP｜未分類專案負責人',
      })
    );
    const dialog = screen.getByRole('dialog', { name: '與負責人聯繫' });
    expect(dialog).toHaveTextContent('未開啟或傳送任何訊息');
    await userEvent.click(
      within(dialog).getByRole('button', { name: '了解，返回' })
    );
    expect(projectNames()).toHaveLength(9);
  });
});

describe('ManagementView：呈報選取（US-004）', () => {
  it('預設全部納入，全部取消時預覽報告不可用並顯示 0（SC-005）', async () => {
    setup();
    expect(screen.getByText('呈報專案 9 個')).toBeInTheDocument();
    for (const toggle of screen.getAllByRole('switch')) {
      expect(toggle).toBeChecked();
      await userEvent.click(toggle);
    }
    expect(screen.getByText('呈報專案 0 個')).toBeInTheDocument();
    for (const button of screen.getAllByRole('button', { name: '預覽報告' })) {
      expect(button).toBeDisabled();
    }
  });

  it('預覽只包含已選專案，可返回面板（SC-004）', async () => {
    setup();
    await userEvent.click(
      screen.getByRole('switch', { name: '將Frontend｜統智納入呈報' })
    );
    await userEvent.click(
      screen.getByRole('switch', { name: '將Frontend｜季河-候位納入呈報' })
    );
    await userEvent.click(
      screen.getAllByRole('button', { name: '預覽報告' })[0]
    );
    expect(
      screen.getByRole('heading', { level: 1, name: '資訊專案進度報告' })
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole('heading', { level: 3 }).map(h => h.textContent)
    ).not.toContain('Frontend｜統智');
    expect(screen.getAllByText(/\d+ \/ 4/)).toHaveLength(4);
    expect(
      screen.getByRole('button', { name: '列印／另存 PDF' })
    ).toBeEnabled();
    await userEvent.click(screen.getByRole('button', { name: '返回面板' }));
    expect(screen.getByText('呈報專案 7 個')).toBeInTheDocument();
  });

  it('列印按鈕呼叫瀏覽器列印', async () => {
    const print = jest.spyOn(window, 'print').mockImplementation(() => {});
    setup();
    await userEvent.click(
      screen.getAllByRole('button', { name: '預覽報告' })[0]
    );
    await userEvent.click(
      screen.getByRole('button', { name: '列印／另存 PDF' })
    );
    expect(print).toHaveBeenCalled();
    print.mockRestore();
  });
});

describe('ManagementView：工作列表（US-003）', () => {
  it('以案件為單位列出並可搜尋案件、專案或負責人', async () => {
    setup();
    await userEvent.click(screen.getByRole('tab', { name: '工作列表' }));
    expect(screen.getAllByRole('article')).toHaveLength(16);
    await userEvent.type(
      screen.getByRole('searchbox', { name: '搜尋管理層工作列表' }),
      'herbert'
    );
    expect(screen.getAllByRole('article')).toHaveLength(2);
    await userEvent.click(
      screen.getAllByRole('button', {
        name: /透過 Teams 聯繫.*負責人Herbert/,
      })[0]
    );
    expect(
      screen.getByRole('dialog', { name: '與負責人聯繫' })
    ).toHaveTextContent('Herbert');
  });

  it('查無案件時顯示空狀態', async () => {
    setup();
    await userEvent.click(screen.getByRole('tab', { name: '工作列表' }));
    await userEvent.type(
      screen.getByRole('searchbox', { name: '搜尋管理層工作列表' }),
      'zzz'
    );
    expect(screen.getByText('沒有符合條件的案件。')).toBeInTheDocument();
  });
});
