/**
 * @jest-environment node
 */
import {
  mkdtempSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  cpSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseSnapshot } from '@/lib/pmo/snapshotSchema';
import {
  buildSnapshot,
  main,
  parseSheetCsv,
  SnapshotBuildError,
} from './buildSnapshot';

const FIXTURES = join(__dirname, '../../tests/fixtures');
const csvOf = (g: string) =>
  readFileSync(join(FIXTURES, 'csv', `${g}.csv`), 'utf8');
const config = JSON.parse(
  readFileSync(join(FIXTURES, 'snapshot.config.json'), 'utf8')
);
const allCsv = () => ({
  Frontend: csvOf('Frontend'),
  Project: csvOf('Project'),
  BPM: csvOf('BPM'),
  SAP: csvOf('SAP'),
});

describe('parseSheetCsv', () => {
  let sheet: ReturnType<typeof parseSheetCsv>;
  beforeAll(() => {
    sheet = parseSheetCsv(csvOf('Frontend'), 'Frontend');
  });

  it('第一列為標題列，共 15 欄（含 Progress 與無標題的燈號欄）', () => {
    expect(sheet.headers).toHaveLength(15);
    expect(sheet.headers[3]).toBe('Issue/Follow-up Action Description');
    expect(sheet.headers[13]).toBe('Progress');
  });

  it('保留原表列號，並略過案件名稱空白的列', () => {
    expect(sheet.rows.map(r => r.sourceRow)).toEqual([2, 4, 9, 23]);
  });

  it('儲存格內換行保留；Progress 與燈號沿用原文', () => {
    const pos = sheet.rows[0];
    expect(pos.values[3]).toBe('POS優化');
    expect(pos.values[10].split('\n').length).toBeGreaterThan(3);
    expect(pos.values).toHaveLength(15);
    expect(pos.values[13]).toBe('65%');
    expect(pos.values[14]).toBe('🟢 綠燈');
  });

  it('只有 13 欄的分頁：Progress 與燈號補空白並發出警告', () => {
    const warn = jest.fn();
    const sap = parseSheetCsv(csvOf('SAP'), 'SAP', warn);
    expect(sap.headers).toHaveLength(15);
    expect(sap.rows[0].values).toHaveLength(15);
    expect(sap.rows[0].values.slice(13)).toEqual(['', '']);
    expect(warn).toHaveBeenCalledWith(
      expect.stringMatching(/SAP.*Progress.*燈號/)
    );
  });

  it('去除尾端多餘的空白欄位（試算表匯出常見）', () => {
    const csv =
      'a,b,c,Issue/Follow-up Action Description,e,f,g,h,i,j,LOG,Status,m,Progress,,,\n1,,,X,,,,,,,,,,,,,';
    expect(parseSheetCsv(csv, 'SAP').rows[0].values).toHaveLength(15);
  });

  it('標題欄數或關鍵欄位不符時拋錯並指出分頁', () => {
    expect(() => parseSheetCsv('a,b\n1,2', 'BPM')).toThrow(/BPM.*13 或 15/);
    const wrong = 'a,b,c,Title,e,f,g,h,i,j,LOG,Status,m\n';
    expect(() => parseSheetCsv(wrong, 'BPM')).toThrow(/BPM.*Description/);
    const noProgress = 'a,b,c,Description,e,f,g,h,i,j,LOG,Status,m,完成,燈\n';
    expect(() => parseSheetCsv(noProgress, 'BPM')).toThrow(
      /BPM.*第 14 欄.*Progress/
    );
  });

  it('資料列超過 15 欄且多出的欄位有內容時，指出分頁與列號', () => {
    const bad = `${headerLine('Frontend')}\n1,,,X,,,,,,,,,,,,extra`;
    expect(() => parseSheetCsv(bad, 'Frontend')).toThrow(/Frontend.*第 2 列/);
  });

  it('Progress 或燈號無法辨識時，指出分頁、列號與原值（SC-010）', () => {
    const progress = `${headerLine('Frontend')}\n1,,,X,,,,,,,,,,約九成,`;
    expect(() => parseSheetCsv(progress, 'Frontend')).toThrow(
      /Frontend.*第 2 列.*Progress.*約九成/
    );
    const light = `${headerLine('Frontend')}\n1,,,X,,,,,,,,,,50%,藍燈`;
    expect(() => parseSheetCsv(light, 'Frontend')).toThrow(
      /Frontend.*第 2 列.*燈號.*藍燈/
    );
  });
});

function headerLine(g: string): string {
  const text = csvOf(g);
  // 標題列含引號內換行，取到第一個資料列之前
  return text.slice(0, text.indexOf('\n1,'));
}

describe('buildSnapshot', () => {
  it('四個分頁組成快照並通過 schema', () => {
    const warn = jest.fn();
    const snap = buildSnapshot(allCsv(), config, '2026-09-15', warn);
    expect(() => parseSnapshot(snap)).not.toThrow();
    expect(snap.schemaVersion).toBe(2);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(snap.capturedAt).toBe('2026-09-15');
    expect(snap.sheets.BPM.sheetId).toBe(config.sheets.BPM.sheetId);
    expect(Object.values(snap.sheets).flatMap(s => s.rows)).toHaveLength(16);
  });

  it('缺少分頁 CSV 或設定時拋出 SnapshotBuildError', () => {
    const csv = allCsv() as Record<string, string>;
    delete csv.SAP;
    expect(() => buildSnapshot(csv, config, '2026-09-15')).toThrow(
      SnapshotBuildError
    );
    const noCfg = { ...config, sheets: { ...config.sheets, SAP: undefined } };
    expect(() => buildSnapshot(allCsv(), noCfg, '2026-09-15')).toThrow(/SAP/);
  });

  it('擷取日期格式錯誤時拋錯', () => {
    expect(() => buildSnapshot(allCsv(), config, '9/15')).toThrow(
      SnapshotBuildError
    );
  });
});

describe('main（CLI）', () => {
  function workspace(): string {
    const dir = mkdtempSync(join(tmpdir(), 'snap-'));
    mkdirSync(join(dir, 'data'));
    cpSync(join(FIXTURES, 'csv'), join(dir, 'data', 'raw'), {
      recursive: true,
    });
    writeFileSync(
      join(dir, 'data', 'snapshot.config.json'),
      JSON.stringify(config)
    );
    return dir;
  }

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());

  it('寫出 data/snapshot.json 並回傳 0', () => {
    const dir = workspace();
    expect(main(['--captured-at', '2026-09-15'], dir)).toBe(0);
    const out = JSON.parse(
      readFileSync(join(dir, 'data', 'snapshot.json'), 'utf8')
    );
    expect(parseSnapshot(out).capturedAt).toBe('2026-09-15');
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('SAP'));
  });

  it('缺少 --captured-at 或 CSV 時回傳 1 並列出原因', () => {
    const dir = workspace();
    expect(main([], dir)).toBe(1);
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('--captured-at')
    );
    expect(
      main(['--captured-at', '2026-09-15'], mkdtempSync(join(tmpdir(), 'x-')))
    ).toBe(1);
  });
});
