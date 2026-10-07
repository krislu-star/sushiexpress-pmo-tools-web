import type { Case } from '@/lib/pmo/cases';
import type { Snapshot } from '@/lib/pmo/snapshotSchema';

const HEADERS = Array.from({ length: 15 }, (_, i) => `H${i}`);

/** 建立測試用快照；rows 只需填要覆寫的欄位索引。 */
export function snapshotWith(
  rows: Partial<Record<keyof Snapshot['sheets'], Array<Record<number, string>>>>
): Snapshot {
  const sheet = (g: keyof Snapshot['sheets'], sheetId: number) => ({
    sheetId,
    headers: HEADERS,
    rows: (rows[g] ?? []).map((cells, i) => ({
      sourceRow: i + 2,
      values: Array.from(
        { length: 15 },
        (_, c) => cells[c] ?? (c === 3 ? `${g} 案件 ${i + 1}` : '')
      ),
    })),
  });
  return {
    schemaVersion: 2,
    capturedAt: '2026-09-15',
    spreadsheetId: 'SHEET',
    sheets: {
      Frontend: sheet('Frontend', 10),
      Project: sheet('Project', 20),
      BPM: sheet('BPM', 30),
      SAP: sheet('SAP', 40),
    },
  };
}

/** 建立測試用案件。 */
export function caseWith(overrides: Partial<Case> = {}): Case {
  return {
    id: 'Frontend-row-2',
    order: 0,
    group: 'Frontend',
    title: '案件',
    project: 'Frontend｜未分類',
    category: '未提供',
    department: '未提供',
    owner: '未提供',
    status: '未提供',
    due: '未提供',
    bpmId: '',
    log: '',
    latest: '原表尚無 LOG',
    progress: null,
    sheetLight: 'gray',
    updated: null,
    sourceRow: 2,
    sourceSheetId: 10,
    sourceUrl: '',
    ...overrides,
  };
}
