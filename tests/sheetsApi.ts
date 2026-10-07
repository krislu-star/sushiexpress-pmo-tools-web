import { parse } from 'csv-parse/sync';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const GROUPS = ['Frontend', 'Project', 'BPM', 'SAP'] as const;
const FIXTURES = join(__dirname, 'fixtures');

/** 模擬 Sheets API：省略每列尾端空白格與尾端空白列。 */
export function toApiValues(csv: string): string[][] {
  const rows: string[][] = parse(csv, { relax_column_count: true });
  const trimmed = rows.map(r => {
    let end = r.length;
    while (end > 0 && r[end - 1] === '') end -= 1;
    return r.slice(0, end);
  });
  while (trimmed.length && !trimmed[trimmed.length - 1].length) trimmed.pop();
  return trimmed;
}

/** 由測試 CSV fixture 產生的四個分頁 values。 */
export function fixtureValues(): Record<string, string[][]> {
  return Object.fromEntries(
    GROUPS.map(g => [
      g,
      toApiValues(readFileSync(join(FIXTURES, 'csv', `${g}.csv`), 'utf8')),
    ])
  );
}

interface FakeOptions {
  values?: Record<string, string[][]>;
  sheetIds?: Record<string, number>;
  metaStatus?: number;
  batchStatus?: number;
  missingTab?: string;
  networkError?: boolean;
  /** 中繼資料不含 sheets 欄位 */
  emptyMeta?: boolean;
}

/** 假的 Sheets API fetch：記錄請求並依選項回應。 */
export function fakeSheetsFetch(options: FakeOptions = {}) {
  const values = options.values ?? fixtureValues();
  const sheetIds = options.sheetIds ?? {
    Frontend: 11,
    Project: 22,
    BPM: 33,
    SAP: 44,
  };
  const calls: string[] = [];
  const fetch = jest.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      calls.push(url);
      if (options.networkError) throw new TypeError('fetch failed');
      const auth = (init?.headers as Record<string, string>)?.Authorization;
      if (auth !== 'Bearer TOKEN') return new Response('{}', { status: 401 });
      if (url.includes(':batchGet')) {
        if (options.batchStatus)
          return new Response('{}', { status: options.batchStatus });
        const ranges = new URL(url).searchParams.getAll('ranges');
        const valueRanges = ranges.map(r => {
          const title = r.replace(/^'|'!A:O$/g, '').replace(/'!A:O$/, '');
          const rows = values[title] ?? [];
          // 真實 API 在分頁沒有資料時省略 values
          return rows.length ? { range: r, values: rows } : { range: r };
        });
        return Response.json({ valueRanges });
      }
      if (options.metaStatus)
        return new Response('{}', { status: options.metaStatus });
      if (options.emptyMeta) return Response.json({});
      const sheets = GROUPS.filter(g => g !== options.missingTab).map(g => ({
        properties: { title: g, sheetId: sheetIds[g] },
      }));
      return Response.json({
        sheets: [
          ...sheets,
          { properties: { title: '彙整', sheetId: 901643885 } },
        ],
      });
    }
  );
  return { fetch, calls };
}
