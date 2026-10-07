import { parse } from 'csv-parse/sync';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  GROUPS,
  parseSnapshot,
  SnapshotError,
  type Group,
  type Sheet,
  type Snapshot,
} from '../../src/lib/pmo/snapshotSchema';
import { parseConfig, type SnapshotConfig } from './config';
import {
  parseSheetRows,
  SnapshotBuildError,
  type WarningHandler,
} from './parseSheetRows';

export { SnapshotBuildError, type WarningHandler };

/**
 * 解析單一分頁的 CSV（儲存格內換行不影響列號），規則見 {@link parseSheetRows}。
 * @param warn 非致命問題的警告回呼
 * @throws {SnapshotBuildError} 欄位不符時，訊息含分頁與列號
 */
export function parseSheetCsv(
  csv: string,
  group: string,
  warn: WarningHandler = () => {}
): Omit<Sheet, 'sheetId'> {
  const records: string[][] = parse(csv, {
    relax_column_count: true,
    bom: true,
  });
  return parseSheetRows(records, group, warn);
}

/**
 * 由四個分頁的 CSV 組成快照並驗證。
 * @param csvByGroup 各分頁 CSV 文字
 * @param config spreadsheetId 與各分頁 sheetId
 * @param capturedAt 擷取日期 YYYY-MM-DD
 * @throws {SnapshotBuildError} 缺分頁、缺設定或格式不符時
 */
export function buildSnapshot(
  csvByGroup: Partial<Record<Group, string>>,
  config: SnapshotConfig,
  capturedAt: string,
  warn: WarningHandler = () => {}
): Snapshot {
  const sheets = Object.fromEntries(
    GROUPS.map(group => {
      const csv = csvByGroup[group];
      const sheetId = config.sheets[group]?.sheetId;
      if (csv === undefined)
        throw new SnapshotBuildError(`缺少 ${group} 分頁 CSV`);
      if (sheetId === undefined)
        throw new SnapshotBuildError(`設定缺少 ${group} 的 sheetId`);
      return [group, { sheetId, ...parseSheetCsv(csv, group, warn) }];
    })
  );
  const snapshot = {
    schemaVersion: 2,
    capturedAt,
    spreadsheetId: config.spreadsheetId,
    sheets,
  };
  try {
    return parseSnapshot(snapshot);
  } catch (error) {
    throw new SnapshotBuildError((error as SnapshotError).message);
  }
}

/** 讀取 `--captured-at` 參數。 */
function capturedAtArg(argv: string[]): string {
  const index = argv.indexOf('--captured-at');
  const value = index >= 0 ? argv[index + 1] : undefined;
  if (!value)
    throw new SnapshotBuildError('請以 --captured-at YYYY-MM-DD 指定擷取日期');
  return value;
}

/** 讀取 `data/raw/{分頁}.csv` 與 `data/snapshot.config.json`。 */
function readInputs(cwd: string) {
  const configPath = join(cwd, 'data', 'snapshot.config.json');
  if (!existsSync(configPath))
    throw new SnapshotBuildError(`找不到 ${configPath}`);
  const csv = Object.fromEntries(
    GROUPS.map(g => [g, join(cwd, 'data', 'raw', `${g}.csv`)])
      .filter(([, path]) => existsSync(path))
      .map(([g, path]) => [g, readFileSync(path, 'utf8')])
  );
  return {
    csv,
    config: parseConfig(JSON.parse(readFileSync(configPath, 'utf8'))),
  };
}

/**
 * CLI：`pnpm snapshot:build --captured-at YYYY-MM-DD`，輸出 `data/snapshot.json`。
 * @returns 結束碼：成功 0，失敗 1
 */
export function main(argv: string[], cwd: string): number {
  try {
    const capturedAt = capturedAtArg(argv);
    const { csv, config } = readInputs(cwd);
    const snapshot = buildSnapshot(csv, config, capturedAt, message =>
      console.warn(`警告：${message}`)
    );
    writeFileSync(
      join(cwd, 'data', 'snapshot.json'),
      `${JSON.stringify(snapshot, null, 2)}\n`
    );
    const counts = GROUPS.map(
      g => `${g} ${snapshot.sheets[g].rows.length}`
    ).join('、');
    console.log(`已輸出 data/snapshot.json（${capturedAt}）：${counts} 件`);
    return 0;
  } catch (error) {
    console.error((error as Error).message);
    return 1;
  }
}

/* istanbul ignore next -- CLI 進入點 */
if (require.main === module) {
  process.exitCode = main(process.argv.slice(2), process.cwd());
}
