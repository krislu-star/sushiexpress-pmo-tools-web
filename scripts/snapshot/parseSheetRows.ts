import {
  parseLight,
  parseProgress,
  SheetFieldError,
} from '../../src/lib/pmo/sheetFields';
import {
  COLUMN,
  COLUMN_COUNT,
  LEGACY_COLUMN_COUNT,
  type Sheet,
} from '../../src/lib/pmo/snapshotSchema';

/** 快照轉換失敗時拋出。 */
export class SnapshotBuildError extends Error {
  override name = 'SnapshotBuildError';
}

/** 去除尾端空白欄位（試算表匯出常多出空欄）。 */
function trimTrailing(cells: string[]): string[] {
  let end = cells.length;
  while (end > 0 && cells[end - 1].trim() === '') end -= 1;
  return cells.slice(0, end);
}

/** 警告回呼（例如分頁尚未補上 Progress 與燈號欄）。 */
export type WarningHandler = (message: string) => void;

const KEY_HEADERS: [number, string][] = [
  [COLUMN.title, 'Description'],
  [COLUMN.log, 'LOG'],
  [COLUMN.status, 'Status'],
];

/**
 * 檢查標題列並補齊為 15 欄。13 欄的舊版分頁補上 Progress 與燈號欄並發出警告；
 * 燈號欄原表可無標題（匯出時會被視為尾端空白）。
 */
function normalizeHeaders(
  raw: string[],
  group: string,
  warn: WarningHandler
): string[] {
  if (raw.length === LEGACY_COLUMN_COUNT) {
    warn(
      `${group} 分頁尚未有 Progress 與燈號欄，兩欄視為空白（完成度未提供、燈號待評估）`
    );
  } else if (raw.length < LEGACY_COLUMN_COUNT || raw.length > COLUMN_COUNT) {
    throw new SnapshotBuildError(
      `${group} 分頁標題列應為 13 或 15 欄，實際 ${raw.length} 欄`
    );
  } else if (!raw[COLUMN.progress].includes('Progress')) {
    throw new SnapshotBuildError(
      `${group} 分頁第 14 欄標題應為「Progress」，實際為「${raw[COLUMN.progress]}」`
    );
  }
  for (const [index, keyword] of KEY_HEADERS) {
    if (!raw[index].includes(keyword)) {
      throw new SnapshotBuildError(
        `${group} 分頁第 ${index + 1} 欄標題應包含「${keyword}」，實際為「${raw[index]}」`
      );
    }
  }
  const legacy = raw.length === LEGACY_COLUMN_COUNT;
  return Array.from(
    { length: COLUMN_COUNT },
    (_, i) => raw[i] ?? (legacy && i === COLUMN.progress ? 'Progress' : '')
  );
}

/** 將一列資料補齊為 15 欄並驗證 Progress 與燈號；錯誤訊息含分頁與列號。 */
function normalizeRow(cells: string[], group: string, sourceRow: number) {
  const trimmed = trimTrailing(cells);
  if (trimmed.length > COLUMN_COUNT) {
    throw new SnapshotBuildError(
      `${group} 分頁第 ${sourceRow} 列超過 ${COLUMN_COUNT} 欄`
    );
  }
  const values = Array.from(
    { length: COLUMN_COUNT },
    (_, i) => trimmed[i] ?? ''
  );
  try {
    parseProgress(values[COLUMN.progress]);
    parseLight(values[COLUMN.light]);
  } catch (error) {
    throw new SnapshotBuildError(
      `${group} 分頁第 ${sourceRow} 列 ${(error as SheetFieldError).message}`
    );
  }
  return values;
}

/**
 * 解析單一分頁的資料列（CSV 解析結果或 Sheets API 的 values 共用）。
 * 第一列為標題列；原表列號為陣列索引＋1（空白列保留位置），案件名稱空白的列略過。
 * @param warn 非致命問題的警告回呼
 * @throws {SnapshotBuildError} 欄位不符時，訊息含分頁與列號
 */
export function parseSheetRows(
  records: string[][],
  group: string,
  warn: WarningHandler = () => {}
): Omit<Sheet, 'sheetId'> {
  const headers = normalizeHeaders(trimTrailing(records[0] ?? []), group, warn);
  const rows = records
    .slice(1)
    .map((cells, i) => ({ sourceRow: i + 2, cells }))
    .filter(({ cells }) => (cells[COLUMN.title] ?? '').trim() !== '')
    .map(({ sourceRow, cells }) => ({
      sourceRow,
      values: normalizeRow(cells, group, sourceRow),
    }));
  return { headers, rows };
}
