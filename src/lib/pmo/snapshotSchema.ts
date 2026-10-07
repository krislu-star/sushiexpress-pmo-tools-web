import { z } from 'zod';
import { parseLight, parseProgress } from './sheetFields';

/** 快照涵蓋的四個小組分頁（spec FR-003），順序即畫面上的小組順序。 */
export const GROUPS = ['Frontend', 'Project', 'BPM', 'SAP'] as const;

/** 小組名稱。 */
export type Group = (typeof GROUPS)[number];

/** 原表固定 13 欄；各欄的索引。 */
export const COLUMN = {
  sn: 0,
  type: 1,
  project: 2,
  title: 3,
  bpmId: 4,
  priority: 5,
  raisedBy: 6,
  openedDate: 7,
  owner: 8,
  due: 9,
  log: 10,
  status: 11,
  note: 12,
  progress: 13,
  light: 14,
} as const;

/** 快照每列欄數（v2：原表 13 欄＋Progress＋燈號）。 */
export const COLUMN_COUNT = 15;

/** 尚未補上 Progress 與燈號兩欄的舊版分頁欄數。 */
export const LEGACY_COLUMN_COUNT = 13;

/** 欄位值可被解析時回傳 true。 */
function parses(parse: (raw: string) => unknown, raw: string): boolean {
  try {
    parse(raw);
    return true;
  } catch {
    return false;
  }
}

const values = z
  .array(z.string())
  .length(COLUMN_COUNT)
  .refine(v => v[COLUMN.title].trim() !== '', {
    message: '案件名稱不可為空白',
    path: [COLUMN.title],
  })
  .refine(v => parses(parseProgress, v[COLUMN.progress]), {
    message: 'Progress 應為空白或 0%～100%',
    path: [COLUMN.progress],
  })
  .refine(v => parses(parseLight, v[COLUMN.light]), {
    message: '燈號應為空白或紅燈、黃燈、綠燈、待評估',
    path: [COLUMN.light],
  });

const sheetSchema = z
  .object({
    sheetId: z.number().int().nonnegative(),
    headers: z.array(z.string()).length(COLUMN_COUNT),
    rows: z.array(
      z.object({ sourceRow: z.number().int().min(2), values }).strict()
    ),
  })
  .strict();

/** 快照 schema；與 specs/001-pmo-dashboard/contracts/snapshot.schema.json 一致。 */
export const snapshotSchema = z
  .object({
    schemaVersion: z.literal(2),
    capturedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    spreadsheetId: z.string().min(1),
    sheets: z
      .object({
        Frontend: sheetSchema,
        Project: sheetSchema,
        BPM: sheetSchema,
        SAP: sheetSchema,
      })
      .strict(),
  })
  .strict();

/** 通過驗證的快照。 */
export type Snapshot = z.infer<typeof snapshotSchema>;

/** 單一分頁。 */
export type Sheet = Snapshot['sheets'][Group];

/** 快照格式不符時拋出，訊息逐行列出欄位路徑與原因。 */
export class SnapshotError extends Error {
  override name = 'SnapshotError';
}

/**
 * 驗證並回傳快照（Article IV：邊界驗證）。
 * @throws {SnapshotError} 格式不符時
 */
export function parseSnapshot(data: unknown): Snapshot {
  const result = snapshotSchema.safeParse(data);
  if (result.success) return result.data;
  const lines = result.error.issues.map(
    issue => `${issue.path.join('.') || '(root)'}: ${issue.message}`
  );
  throw new SnapshotError(`快照格式不符：\n${lines.join('\n')}`);
}
