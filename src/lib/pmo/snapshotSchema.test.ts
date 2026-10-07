import {
  GROUPS,
  parseSnapshot,
  SnapshotError,
  snapshotSchema,
} from './snapshotSchema';

const headers = [
  'S/N',
  'Type',
  'Project/Catalog',
  'Issue/Follow-up Action Description',
  'BPM單號',
  'Priority',
  'Raised by',
  'Opened Date',
  'Owned by*',
  'Due Date',
  'LOG',
  'Status',
  'Note',
  'Progress',
  '',
];
const row = (title: string, sourceRow = 2) => ({
  sourceRow,
  values: [
    '1',
    '客製',
    '統智',
    title,
    '',
    'M',
    'A',
    '5/1',
    'A',
    '12/31',
    'log',
    'Open',
    '',
    '90%',
    '🟢 綠燈',
  ],
});
const sheet = (sheetId: number) => ({
  sheetId,
  headers,
  rows: [row('POS優化')],
});

function valid() {
  return {
    schemaVersion: 2,
    capturedAt: '2026-09-15',
    spreadsheetId: 'abc',
    sheets: {
      Frontend: sheet(1),
      Project: sheet(2),
      BPM: sheet(3),
      SAP: sheet(4),
    },
  };
}

describe('parseSnapshot', () => {
  it('四組固定為 Frontend、Project、BPM、SAP', () => {
    expect(GROUPS).toEqual(['Frontend', 'Project', 'BPM', 'SAP']);
  });

  it('snapshotSchema 可供其他模組直接驗證', () => {
    expect(snapshotSchema.safeParse(valid()).success).toBe(true);
  });

  it('合法快照通過並回傳型別化資料', () => {
    const snap = parseSnapshot(valid());
    expect(snap.sheets.SAP.sheetId).toBe(4);
    expect(snap.sheets.Frontend.rows[0].values[3]).toBe('POS優化');
  });

  it.each([
    ['缺分頁', (s: any) => delete s.sheets.BPM],
    ['多餘分頁', (s: any) => (s.sheets.DW = sheet(5))],
    ['欄數不是 15', (s: any) => s.sheets.SAP.rows[0].values.pop()],
    ['標題欄數不是 15', (s: any) => s.sheets.SAP.headers.push('X')],
    ['sourceRow 小於 2', (s: any) => (s.sheets.SAP.rows[0].sourceRow = 1)],
    ['sourceRow 非整數', (s: any) => (s.sheets.SAP.rows[0].sourceRow = 2.5)],
    ['capturedAt 格式錯', (s: any) => (s.capturedAt = '2026/09/15')],
    ['案件名稱空白', (s: any) => (s.sheets.SAP.rows[0].values[3] = '  ')],
    ['schemaVersion 不是 2', (s: any) => (s.schemaVersion = 1)],
    ['spreadsheetId 空白', (s: any) => (s.spreadsheetId = '')],
    [
      'Progress 無法辨識',
      (s: any) => (s.sheets.SAP.rows[0].values[13] = '約九成'),
    ],
    [
      'Progress 超出 100%',
      (s: any) => (s.sheets.SAP.rows[0].values[13] = '120%'),
    ],
    ['燈號無法辨識', (s: any) => (s.sheets.SAP.rows[0].values[14] = '藍燈')],
    ['sheetId 為負數', (s: any) => (s.sheets.SAP.sheetId = -1)],
  ])('%s時拋出 SnapshotError', (_label, mutate) => {
    const data = valid();
    mutate(data);
    expect(() => parseSnapshot(data)).toThrow(SnapshotError);
  });

  it('錯誤訊息包含欄位路徑', () => {
    const data = valid() as any;
    data.sheets.SAP.rows[0].sourceRow = 1;
    expect(() => parseSnapshot(data)).toThrow(
      /sheets\.SAP\.rows\.0\.sourceRow/
    );
  });

  it('根層級不是物件時，訊息標示 (root)', () => {
    expect(() => parseSnapshot(null)).toThrow(/\(root\)/);
    try {
      parseSnapshot('x');
    } catch (error) {
      expect((error as Error).name).toBe('SnapshotError');
    }
  });
});
