import { caseWith } from '../../../tests/factories';
import {
  applyEntries,
  LIGHT_LABELS,
  LIGHTS,
  loadEntries,
  MEETING_STORAGE_KEY,
  saveEntry,
  type MeetingEntries,
} from './meetingStore';
import { sortCases } from './sortCases';

/** 以 Map 模擬 localStorage；可設定讀寫時拋錯。 */
function fakeStorage(
  init: Record<string, string> = {},
  fail: { get?: boolean; set?: boolean } = {}
) {
  const data = new Map(Object.entries(init));
  return {
    data,
    getItem: (k: string) => {
      if (fail.get) throw new Error('blocked');
      return data.get(k) ?? null;
    },
    setItem: (k: string, v: string) => {
      if (fail.set) throw new Error('quota');
      data.set(k, v);
    },
  };
}

const entry = (over: object = {}) => ({
  light: 'red',
  risk: '人力不足',
  next: '週五前確認',
  due: '2026-10-01',
  updated: '2026-09-20',
  titleFingerprint: 'POS優化',
  ...over,
});

describe('燈號定義', () => {
  it('四種燈號與顯示文字，排序為紅 → 黃 → 待評估 → 綠', () => {
    expect(LIGHTS).toEqual(['red', 'yellow', 'gray', 'green']);
    expect(LIGHT_LABELS.gray).toBe('⚪ 待評估');
    expect(MEETING_STORAGE_KEY).toBe('sushi-pmo-meeting-v1');
  });
});

describe('loadEntries', () => {
  it('讀取並驗證有效紀錄', () => {
    const storage = fakeStorage({
      [MEETING_STORAGE_KEY]: JSON.stringify({ a: entry() }),
    });
    expect(loadEntries(storage)).toEqual({ entries: { a: entry() } });
  });

  it('沒有紀錄時回傳空集合', () => {
    expect(loadEntries(fakeStorage())).toEqual({ entries: {} });
  });

  it('逐筆驗證：燈號值不存在或欄位型別不符者忽略，其餘保留（SC-009）', () => {
    const raw = {
      a: entry(),
      b: entry({ light: 'blue' }),
      c: entry({ risk: 3 }),
      d: null,
      e: entry({ extra: 1 }),
    };
    const storage = fakeStorage({ [MEETING_STORAGE_KEY]: JSON.stringify(raw) });
    expect(Object.keys(loadEntries(storage).entries)).toEqual(['a', 'e']);
  });

  it('JSON 損毀或不是物件時回傳空集合與錯誤訊息', () => {
    for (const bad of ['{oops', '[1,2]', '"x"']) {
      const result = loadEntries(fakeStorage({ [MEETING_STORAGE_KEY]: bad }));
      expect(result.entries).toEqual({});
      expect(result.error).toMatch(/本機儲存/);
    }
  });

  it('無法存取本機儲存時回傳空集合與錯誤訊息', () => {
    expect(loadEntries(fakeStorage({}, { get: true })).error).toMatch(
      /無法讀取本機儲存/
    );
    expect(loadEntries(null).error).toMatch(/無法讀取本機儲存/);
  });
});

describe('applyEntries', () => {
  const cases = [
    caseWith({
      id: 'a',
      order: 0,
      title: 'POS優化',
      due: '12/31',
      sheetLight: 'green',
    }),
    caseWith({ id: 'b', order: 1, title: '憑證', due: '未提供' }),
  ];

  it('名稱相符的紀錄套用到案件', () => {
    const [a] = applyEntries(cases, { a: entry() } as MeetingEntries);
    expect(a).toMatchObject({
      light: 'red',
      lightRank: 0,
      risk: '人力不足',
      next: '週五前確認',
      due: '2026-10-01',
      updated: '2026-09-20',
      lightSource: 'local',
    });
  });

  it('沒有紀錄時用原表燈號（SC-010）', () => {
    const [a] = applyEntries(cases, {});
    expect(a).toMatchObject({
      light: 'green',
      lightRank: 3,
      lightSource: 'sheet',
    });
  });

  it('原表燈號空白且沒有紀錄時為待評估，預計完成日沿用原表', () => {
    const [, b] = applyEntries(cases, {});
    expect(b).toMatchObject({
      lightSource: 'sheet',
      light: 'gray',
      lightRank: 2,
      risk: '',
      next: '',
      due: '未提供',
      updated: null,
    });
  });

  it('名稱指紋不符（列號位移）時忽略該筆（ADR-005）', () => {
    const [a] = applyEntries(cases, {
      a: entry({ titleFingerprint: '別的案件' }),
    } as MeetingEntries);
    expect(a).toMatchObject({ light: 'green', lightSource: 'sheet' });
  });

  it('可用 lightRank 依紅 → 黃 → 待評估 → 綠排序', () => {
    const entries = {
      a: entry({ light: 'green' }),
      b: entry({ light: 'yellow', titleFingerprint: '憑證' }),
    } as MeetingEntries;
    const sorted = sortCases(applyEntries(cases, entries), 'lightRank', 'asc');
    expect(sorted.map(c => c.light)).toEqual(['yellow', 'green']);
  });
});

describe('saveEntry', () => {
  const target = caseWith({ id: 'a', title: 'POS優化' });
  const draft = {
    light: 'red' as const,
    risk: '人力不足',
    next: '週五前確認',
    due: '2026-10-01',
  };

  it('寫入當日更新日期與名稱指紋並存到本機（SC-007）', () => {
    const storage = fakeStorage();
    const result = saveEntry(storage, {}, target, draft, '2026-09-23');
    expect(result.saved).toBe(true);
    expect(result.entries.a).toEqual({
      ...draft,
      updated: '2026-09-23',
      titleFingerprint: 'POS優化',
    });
    expect(JSON.parse(storage.data.get(MEETING_STORAGE_KEY)!)).toEqual(
      result.entries
    );
    expect(result.message).toMatch(/未回寫工作表/);
  });

  it('保留其他案件的紀錄且不改變輸入', () => {
    const before = { b: entry({ titleFingerprint: '憑證' }) } as MeetingEntries;
    const result = saveEntry(
      fakeStorage(),
      before,
      target,
      draft,
      '2026-09-23'
    );
    expect(Object.keys(result.entries)).toEqual(['b', 'a']);
    expect(Object.keys(before)).toEqual(['b']);
  });

  it('本機儲存不可用時仍回傳更新後的紀錄，並提示只保留至離開此頁（SC-008）', () => {
    for (const storage of [fakeStorage({}, { set: true }), null]) {
      const result = saveEntry(storage, {}, target, draft, '2026-09-23');
      expect(result.saved).toBe(false);
      expect(result.entries.a.light).toBe('red');
      expect(result.message).toMatch(/僅保留至離開此頁/);
    }
  });
});
