/**
 * @jest-environment node
 */
import { ConfigError, configSchema, parseConfig } from './config';

const valid = {
  spreadsheetId: 'SHEET',
  sheets: {
    Frontend: { title: 'Frontend', sheetId: 1 },
    Project: { title: 'Project', sheetId: 2 },
    BPM: { title: 'BPM' },
    SAP: { title: 'SAP', sheetId: 4 },
  },
};

describe('parseConfig（snapshot.config.json v2）', () => {
  it('合法設定：分頁名稱必填、sheetId 可省略', () => {
    const config = parseConfig(valid);
    expect(config.sheets.BPM).toEqual({ title: 'BPM' });
    expect(config.sheets.SAP.sheetId).toBe(4);
  });

  it.each([
    ['缺 spreadsheetId', (c: any) => delete c.spreadsheetId],
    ['缺分頁', (c: any) => delete c.sheets.SAP],
    ['分頁名稱空白', (c: any) => (c.sheets.SAP.title = ' ')],
    ['sheetId 非整數', (c: any) => (c.sheets.SAP.sheetId = 'x')],
    ['多餘欄位', (c: any) => (c.extra = 1)],
  ])('%s時拋出 ConfigError 並指出欄位', (_label, mutate) => {
    const config = structuredClone(valid);
    mutate(config);
    expect(() => parseConfig(config)).toThrow(ConfigError);
  });

  it('configSchema 可直接使用；根層級錯誤標示 (root)', () => {
    expect(configSchema.safeParse(valid).success).toBe(true);
    expect(() => parseConfig(null)).toThrow(/\(root\)/);
  });

  it('錯誤訊息包含欄位路徑', () => {
    const config = structuredClone(valid) as any;
    config.sheets.SAP.title = '';
    expect(() => parseConfig(config)).toThrow(/sheets\.SAP\.title/);
  });
});
