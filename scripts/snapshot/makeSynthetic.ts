import { writeFileSync } from 'node:fs';
import { LIGHT_LABELS, LIGHTS } from '../../src/lib/pmo/sheetFields';
import { GROUPS, type Snapshot } from '../../src/lib/pmo/snapshotSchema';

const HEADERS = [
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
const STATUSES = ['Open', '進行中', '待確認', '已完成', ''];
const OWNERS = ['Owner A', 'Owner B', 'Owner C', 'Owner D', ''];

/** 產生第 n 件合成案件的 15 欄資料（內容可重現，不含真實資料）。 */
function values(group: string, n: number): string[] {
  const log = Array.from(
    { length: (n % 5) + 1 },
    (_, i) => `${9 - i}/${(n % 28) + 1} 合成進度 ${i}`
  );
  return [
    String(n),
    n % 2 ? '客製' : '維運',
    `分類 ${n % 12}`,
    `${group} 合成案件 ${n}`,
    n % 3 ? `ITS${String(n).padStart(9, '0')}` : '',
    'M',
    'PM',
    '1/1',
    OWNERS[n % OWNERS.length],
    `${(n % 12) + 1}/30`,
    log.join('\n'),
    STATUSES[n % STATUSES.length],
    '',
    n % 4 ? `${(n * 7) % 101}%` : '',
    n % 6 ? LIGHT_LABELS[LIGHTS[n % LIGHTS.length]] : '',
  ];
}

/**
 * 產生合成快照，供效能測試（spec NFR-001：設計上限 500 件）。
 * @param total 總件數，依序平均分配到四組
 */
export function makeSynthetic(total: number): Snapshot {
  const sheets = Object.fromEntries(
    GROUPS.map((group, g) => {
      const count = Math.floor(total / 4) + (g < total % 4 ? 1 : 0);
      const rows = Array.from({ length: count }, (_, i) => ({
        sourceRow: i + 2,
        values: values(group, i + 1),
      }));
      return [group, { sheetId: g, headers: HEADERS, rows }];
    })
  ) as Snapshot['sheets'];
  return {
    schemaVersion: 2,
    capturedAt: '2026-09-15',
    spreadsheetId: 'synthetic',
    sheets,
  };
}

/* istanbul ignore next -- CLI 進入點 */
if (require.main === module) {
  const [total = '500', out = 'tests/fixtures/snapshot.500.json'] =
    process.argv.slice(2);
  writeFileSync(
    out,
    `${JSON.stringify(makeSynthetic(Number(total)), null, 2)}\n`
  );
  console.log(`已輸出 ${out}`);
}
