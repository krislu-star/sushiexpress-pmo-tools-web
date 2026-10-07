import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import sample from '../../../tests/fixtures/snapshot.sample.json';
import { chooseOption } from '../../../tests/select';
import { toCases } from '@/lib/pmo/cases';
import { MEETING_STORAGE_KEY } from '@/lib/pmo/meetingStore';
import { parseSnapshot } from '@/lib/pmo/snapshotSchema';
import { MeetingView } from './MeetingView';

const cases = toCases(parseSnapshot(sample));
const titles = () =>
  screen
    .getAllByRole('row')
    .slice(1)
    .map(r => within(r).getAllByRole('cell')[1].textContent);
const stat = (label: RegExp) => screen.getByRole('button', { name: label });

async function setup() {
  render(<MeetingView cases={cases} capturedAt="2026-09-15" editable />);
  await waitFor(() =>
    expect(
      screen.getAllByRole('button', { name: /^修改.*燈號$/ })[0]
    ).toBeEnabled()
  );
}

async function saveLight(title: string, light: string, risk = '', next = '') {
  await userEvent.click(
    screen.getByRole('button', { name: `修改${title}燈號` })
  );
  const dialog = screen.getByRole('dialog', { name: '更新會議追蹤' });
  await chooseOption('人工燈號', light);
  if (risk)
    await userEvent.type(
      within(dialog).getByRole('textbox', { name: '風險／需要協助' }),
      risk
    );
  if (next)
    await userEvent.type(
      within(dialog).getByRole('textbox', { name: '下一步' }),
      next
    );
  await userEvent.click(within(dialog).getByRole('button', { name: '儲存' }));
}

describe('MeetingView（US-006）', () => {
  beforeEach(() => localStorage.clear());

  it('初始燈號取自原表，統計與說明正確（SC-010）', async () => {
    await setup();
    expect(
      screen.getByRole('heading', { level: 1, name: 'IT 內部會議' })
    ).toBeInTheDocument();
    expect(stat(/紅燈/)).toHaveTextContent('2');
    expect(stat(/黃燈/)).toHaveTextContent('2');
    expect(stat(/綠燈/)).toHaveTextContent('5');
    expect(stat(/待評估/)).toHaveTextContent('7');
    expect(screen.queryByText('本機修改')).toBeNull();
    expect(screen.getByRole('note')).toHaveTextContent('不回寫工作表');
    expect(
      screen.getByText('預設排序：紅燈 → 黃燈 → 待評估 → 綠燈')
    ).toBeInTheDocument();
  });

  it('將原表綠燈改為紅燈：排入紅燈、統計更新、標示本機修改、更新日期為今天（SC-007）', async () => {
    await setup();
    await saveLight('憑證', '🔴 紅燈', '廠商未回覆', '週五前確認');
    expect(titles().slice(0, 3)).toContain('憑證');
    expect(stat(/紅燈/)).toHaveTextContent('3');
    expect(stat(/綠燈/)).toHaveTextContent('4');
    const row = screen
      .getAllByRole('row')
      .find(r => within(r).queryByText('憑證'))!;
    expect(row).toHaveTextContent('廠商未回覆');
    expect(row).toHaveTextContent('週五前確認');
    expect(row).toHaveTextContent('本機修改');
    expect(row).toHaveTextContent(
      new Date().toLocaleDateString('sv-SE').replaceAll('-', '/')
    );
    expect(screen.getByRole('status')).toHaveTextContent('未回寫工作表');
    expect(
      JSON.parse(localStorage.getItem(MEETING_STORAGE_KEY)!)
    ).toHaveProperty(['Project-row-11']);
  });

  it('重新開啟時保留本機紀錄', async () => {
    const { unmount } = render(
      <MeetingView cases={cases} capturedAt="2026-09-15" editable />
    );
    await waitFor(() =>
      expect(
        screen.getAllByRole('button', { name: /^修改.*燈號$/ })[0]
      ).toBeEnabled()
    );
    await saveLight('憑證', '🟡 黃燈');
    unmount();
    await setup();
    expect(stat(/黃燈/)).toHaveTextContent('3');
  });

  it('點統計篩選燈號，再點一次取消', async () => {
    await setup();
    await userEvent.click(stat(/綠燈/));
    expect(stat(/綠燈/)).toHaveAttribute('aria-pressed', 'true');
    expect(titles()).toHaveLength(5);
    await userEvent.click(stat(/綠燈/));
    expect(titles()).toHaveLength(16);
  });

  it('預設依燈號排序（紅燈在前、綠燈在後）；各欄可切換排序', async () => {
    await setup();
    expect(titles()[0]).toBe('電子看板專案 全品牌');
    expect(titles()[15]).toBe('資訊服務單web services');
    await userEvent.click(screen.getByRole('button', { name: /^案件名稱/ }));
    expect(
      screen.getByRole('columnheader', { name: /案件名稱/ })
    ).toHaveAttribute('aria-sort', 'ascending');
    await userEvent.click(screen.getByRole('button', { name: /^案件名稱/ }));
    expect(
      screen.getByRole('columnheader', { name: /案件名稱/ })
    ).toHaveAttribute('aria-sort', 'descending');
  });

  it('搜尋、依小組與燈號篩選、重設篩選與排序', async () => {
    await setup();
    await userEvent.type(
      screen.getByRole('searchbox', { name: '搜尋會議案件' }),
      'herbert'
    );
    expect(titles()).toHaveLength(2);
    await userEvent.click(
      screen.getByRole('button', { name: '重設篩選與排序' })
    );
    await chooseOption('篩選會議小組', 'SAP');
    expect(titles()).toHaveLength(4);
    await chooseOption('篩選燈號', '🔴 紅燈');
    expect(screen.getByText('沒有符合條件的案件。')).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: '重設篩選與排序' })
    );
    expect(titles()).toHaveLength(16);
  });

  it('取消編輯不改變資料', async () => {
    await setup();
    await userEvent.click(screen.getByRole('button', { name: '修改憑證燈號' }));
    await userEvent.click(screen.getByRole('button', { name: '取消' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(stat(/待評估/)).toHaveTextContent('7');
  });

  it('本機儲存不可用時提示僅保留至離開此頁（SC-008）', async () => {
    const setItem = jest
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('blocked');
      });
    await setup();
    await saveLight('憑證', '🔴 紅燈');
    expect(stat(/紅燈/)).toHaveTextContent('3');
    expect(screen.getByRole('status')).toHaveTextContent('僅保留至離開此頁');
    setItem.mockRestore();
  });
});

describe('MeetingView 唯讀（預設；spec US-005、SC-009）', () => {
  beforeEach(() => localStorage.clear());

  it('未設定 editable 時為唯讀：燈號不可點、無「更新」與操作欄、忽略本機紀錄', async () => {
    localStorage.setItem(
      MEETING_STORAGE_KEY,
      JSON.stringify({
        'Project-row-11': {
          light: 'red',
          risk: 'r',
          next: 'n',
          due: '12/31',
          updated: '2026-09-20',
          titleFingerprint: '憑證',
        },
      })
    );
    render(<MeetingView cases={cases} capturedAt="2026-09-15" />);
    expect(await screen.findAllByRole('row')).not.toHaveLength(0);
    expect(
      screen.queryAllByRole('button', { name: /^修改.*燈號$/ })
    ).toHaveLength(0);
    expect(screen.queryByRole('button', { name: '更新' })).toBeNull();
    expect(screen.queryByRole('columnheader', { name: '操作' })).toBeNull();
    expect(stat(/紅燈/)).toHaveTextContent('2');
    expect(screen.queryByText('本機修改')).toBeNull();
    expect(screen.getByRole('note')).toHaveTextContent('唯讀');
    expect(screen.queryByText('點燈號或「更新」記錄會議結論。')).toBeNull();
  });

  it('唯讀時統計篩選、搜尋、排序照常可用', async () => {
    render(<MeetingView cases={cases} capturedAt="2026-09-15" />);
    await userEvent.click(stat(/綠燈/));
    expect(titles()).toHaveLength(5);
    await userEvent.click(stat(/綠燈/));
    await userEvent.type(
      screen.getByRole('searchbox', { name: '搜尋會議案件' }),
      'herbert'
    );
    expect(titles()).toHaveLength(2);
    await userEvent.click(screen.getByRole('button', { name: /^案件名稱/ }));
    expect(
      screen.getByRole('columnheader', { name: /案件名稱/ })
    ).toHaveAttribute('aria-sort', 'ascending');
  });
});
