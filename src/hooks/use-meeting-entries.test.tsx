import { act, renderHook, waitFor } from '@testing-library/react';
import { caseWith } from '../../tests/factories';
import { MEETING_STORAGE_KEY } from '@/lib/pmo/meetingStore';
import { useMeetingEntries } from './use-meeting-entries';

const cases = [caseWith({ id: 'a', title: 'POS優化' })];
const draft = { light: 'red' as const, risk: 'r', next: 'n', due: '12/31' };

describe('useMeetingEntries', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => jest.restoreAllMocks());

  it('掛載後才讀取本機紀錄，讀取前 ready 為 false', async () => {
    localStorage.setItem(
      MEETING_STORAGE_KEY,
      JSON.stringify({
        a: { ...draft, updated: '2026-09-20', titleFingerprint: 'POS優化' },
      })
    );
    const { result } = renderHook(() => useMeetingEntries(cases));
    await waitFor(() => expect(result.current.ready).toBe(true));
    expect(result.current.cases[0].light).toBe('red');
    expect(result.current.notice).toBe('');
  });

  it('儲存後更新案件並寫入今天日期與提示', async () => {
    const { result } = renderHook(() =>
      useMeetingEntries(cases, () => '2026-09-23')
    );
    await waitFor(() => expect(result.current.ready).toBe(true));
    act(() => result.current.save(cases[0], draft));
    expect(result.current.cases[0]).toMatchObject({
      light: 'red',
      updated: '2026-09-23',
    });
    expect(result.current.notice).toMatch(/未回寫工作表/);
    expect(JSON.parse(localStorage.getItem(MEETING_STORAGE_KEY)!).a.light).toBe(
      'red'
    );
  });

  it('讀取失敗時顯示提示，仍可在記憶體中修改', async () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const { result } = renderHook(() => useMeetingEntries(cases));
    await waitFor(() => expect(result.current.ready).toBe(true));
    expect(result.current.notice).toMatch(/無法讀取本機儲存/);
    act(() => result.current.save(cases[0], draft));
    expect(result.current.cases[0].light).toBe('red');
    expect(result.current.notice).toMatch(/僅保留至離開此頁/);
  });

  it('預設以本地時區的今天為更新日期', async () => {
    const { result } = renderHook(() => useMeetingEntries(cases));
    await waitFor(() => expect(result.current.ready).toBe(true));
    act(() => result.current.save(cases[0], draft));
    expect(result.current.cases[0].updated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('停用時不讀取也不寫入本機紀錄，燈號為原表燈號，save 無作用（spec SC-009）', async () => {
    localStorage.setItem(
      MEETING_STORAGE_KEY,
      JSON.stringify({
        a: { ...draft, updated: '2026-09-20', titleFingerprint: 'POS優化' },
      })
    );
    const getItem = jest.spyOn(Storage.prototype, 'getItem');
    const setItem = jest.spyOn(Storage.prototype, 'setItem');
    const sheetCases = [
      caseWith({ id: 'a', title: 'POS優化', sheetLight: 'green' }),
    ];
    const { result } = renderHook(() =>
      useMeetingEntries(sheetCases, () => '2026-09-23', false)
    );
    await waitFor(() => expect(result.current.ready).toBe(true));
    expect(result.current.cases[0]).toMatchObject({
      light: 'green',
      lightSource: 'sheet',
    });
    act(() => result.current.save(sheetCases[0], draft));
    expect(result.current.cases[0].light).toBe('green');
    expect(result.current.notice).toBe('');
    expect(getItem).not.toHaveBeenCalledWith(MEETING_STORAGE_KEY);
    expect(setItem).not.toHaveBeenCalled();
  });
});
