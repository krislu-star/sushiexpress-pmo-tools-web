/**
 * @jest-environment node
 */
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fakeSheetsFetch, fixtureValues } from '../../tests/sheetsApi';
import { parseSnapshot } from '@/lib/pmo/snapshotSchema';
import {
  capturedAtOf,
  fetchSnapshot,
  main,
  SnapshotFetchError,
} from './fetchSnapshot';
import { SnapshotBuildError } from './buildSnapshot';

const config = {
  spreadsheetId: 'SHEET',
  sheets: {
    Frontend: { title: 'Frontend' },
    Project: { title: 'Project' },
    BPM: { title: 'BPM' },
    SAP: { title: 'SAP' },
  },
};
const now = () => new Date('2026-09-23T01:00:00Z');
const deps = (fetch: typeof globalThis.fetch) => ({
  fetch,
  getToken: async () => 'TOKEN',
  now,
});

describe('capturedAtOf', () => {
  it('以台北時區計算日期', () => {
    expect(capturedAtOf(new Date('2026-09-22T16:30:00Z'))).toBe('2026-09-23');
    expect(capturedAtOf(new Date('2026-09-22T15:59:00Z'))).toBe('2026-09-22');
  });
});

describe('fetchSnapshot（spec SC-001、SC-004）', () => {
  it('以唯讀權杖讀取中繼資料與四個分頁，組成快照 v2', async () => {
    const { fetch, calls } = fakeSheetsFetch();
    const warn = jest.fn();
    const snap = await fetchSnapshot(config, deps(fetch), warn);
    expect(parseSnapshot(snap)).toEqual(snap);
    expect(snap.capturedAt).toBe('2026-09-23');
    expect(snap.spreadsheetId).toBe('SHEET');
    expect(snap.sheets.BPM.sheetId).toBe(33);
    expect(Object.values(snap.sheets).flatMap(s => s.rows)).toHaveLength(16);
    expect(calls[0]).toContain('/spreadsheets/SHEET?fields=sheets.properties');
    expect(calls[1]).toContain('/spreadsheets/SHEET/values:batchGet');
    expect(calls[1]).toContain('valueRenderOption=FORMATTED_VALUE');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('SAP'));
  });

  it('分頁名稱含空白或單引號時正確加上引號', async () => {
    const { fetch, calls } = fakeSheetsFetch();
    const odd = {
      ...config,
      sheets: { ...config.sheets, BPM: { title: "BPM's 表" } },
    };
    await expect(fetchSnapshot(odd, deps(fetch), () => {})).rejects.toThrow(
      /BPM's 表/
    );
    expect(calls).toHaveLength(1);
  });
});

describe('讀取失敗（spec SC-005）', () => {
  it.each([
    [{ metaStatus: 403 }, /HTTP 403.*檢視者/],
    [{ metaStatus: 404 }, /HTTP 404.*spreadsheetId/],
    [{ metaStatus: 500 }, /HTTP 500/],
    [{ batchStatus: 429 }, /HTTP 429/],
    [{ missingTab: 'SAP' }, /找不到分頁「SAP」/],
    [{ emptyMeta: true }, /找不到分頁「Frontend」/],
    [{ networkError: true }, /無法連線到 Google Sheets/],
  ])('%p → SnapshotFetchError', async (options, message) => {
    const { fetch } = fakeSheetsFetch(options);
    const promise = fetchSnapshot(config, deps(fetch), () => {});
    await expect(promise).rejects.toThrow(SnapshotFetchError);
    await expect(
      fetchSnapshot(config, deps(fakeSheetsFetch(options).fetch), () => {})
    ).rejects.toThrow(message);
  });

  it('取得授權失敗', async () => {
    const { fetch } = fakeSheetsFetch();
    const failing = {
      fetch,
      now,
      getToken: async () => Promise.reject(new Error('invalid_grant')),
    };
    await expect(fetchSnapshot(config, failing, () => {})).rejects.toThrow(
      /無法取得讀取授權.*invalid_grant/
    );
  });
});

describe('資料錯誤（spec SC-003）', () => {
  it('Progress 無法辨識時丟出 SnapshotBuildError，訊息含分頁、列號、原值', async () => {
    const values = fixtureValues();
    values.Project[9] = [...values.Project[9].slice(0, 13), '約九成'];
    const { fetch } = fakeSheetsFetch({ values });
    const promise = fetchSnapshot(config, deps(fetch), () => {});
    await expect(promise).rejects.toThrow(SnapshotBuildError);
    await expect(
      fetchSnapshot(config, deps(fakeSheetsFetch({ values }).fetch), () => {})
    ).rejects.toThrow(/Project 分頁第 10 列 Progress「約九成」無法辨識/);
  });
});

describe('空白分頁', () => {
  it('分頁完全沒有資料時，指出分頁與標題列問題', async () => {
    const values = { ...fixtureValues(), SAP: [] };
    await expect(
      fetchSnapshot(config, deps(fakeSheetsFetch({ values }).fetch), () => {})
    ).rejects.toThrow(/SAP 分頁標題列應為 13 或 15 欄，實際 0 欄/);
  });
});

describe('main（CLI）', () => {
  function workspace(): string {
    const dir = mkdtempSync(join(tmpdir(), 'fetch-'));
    mkdirSync(join(dir, 'data'));
    writeFileSync(
      join(dir, 'data', 'snapshot.config.json'),
      JSON.stringify(config)
    );
    return dir;
  }

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());

  it('成功時寫出 data/snapshot.json 並回傳 0', async () => {
    const dir = workspace();
    expect(await main(dir, deps(fakeSheetsFetch().fetch))).toBe(0);
    const snap = parseSnapshot(
      JSON.parse(readFileSync(join(dir, 'data', 'snapshot.json'), 'utf8'))
    );
    expect(snap.capturedAt).toBe('2026-09-23');
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('SAP'));
  });

  it('失敗時不寫出快照並回傳 1', async () => {
    const dir = workspace();
    expect(
      await main(dir, deps(fakeSheetsFetch({ metaStatus: 403 }).fetch))
    ).toBe(1);
    expect(() => readFileSync(join(dir, 'data', 'snapshot.json'))).toThrow();
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('HTTP 403')
    );
  });

  it('設定檔格式錯誤時回傳 1', async () => {
    const dir = workspace();
    writeFileSync(
      join(dir, 'data', 'snapshot.config.json'),
      '{"spreadsheetId":""}'
    );
    expect(await main(dir, deps(fakeSheetsFetch().fetch))).toBe(1);
  });

  it('每次都寫出 update-report.json：成功有警告為 warning、失敗為 failed（spec FR-012）', async () => {
    const ok = workspace();
    await main(ok, deps(fakeSheetsFetch().fetch), { trigger: 'schedule' });
    const report = JSON.parse(
      readFileSync(join(ok, 'update-report.json'), 'utf8')
    );
    expect(report).toMatchObject({
      trigger: 'schedule',
      status: 'warning',
      capturedAt: '2026-09-23',
      counts: { SAP: 4 },
    });
    expect(report.warnings[0]).toContain('SAP');

    const bad = workspace();
    await main(bad, deps(fakeSheetsFetch({ metaStatus: 404 }).fetch), {
      trigger: 'manual',
    });
    const failed = JSON.parse(
      readFileSync(join(bad, 'update-report.json'), 'utf8')
    );
    expect(failed).toMatchObject({
      trigger: 'manual',
      status: 'failed',
      counts: null,
    });
    expect(failed.errors[0]).toContain('HTTP 404');
  });
});
