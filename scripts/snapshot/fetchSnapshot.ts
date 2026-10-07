import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  GROUPS,
  parseSnapshot,
  type Group,
  type Snapshot,
} from '../../src/lib/pmo/snapshotSchema';
import { parseConfig, type SnapshotConfig } from './config';
import {
  parseSheetRows,
  SnapshotBuildError,
  type WarningHandler,
} from './parseSheetRows';
import {
  createReport,
  REPORT_FILE,
  triggerOf,
  type Trigger,
} from './updateReport';

const API = 'https://sheets.googleapis.com/v4/spreadsheets';

/** 無法讀取工作表時拋出（授權、網路、HTTP 錯誤、找不到分頁；spec SC-005）。 */
export class SnapshotFetchError extends Error {
  override name = 'SnapshotFetchError';
}

/** 外部依賴（便於以假服務測試）。 */
export interface FetchDeps {
  fetch: typeof globalThis.fetch;
  /** 取得唯讀存取權杖（scope `spreadsheets.readonly`） */
  getToken: () => Promise<string>;
  now: () => Date;
}

/** 以台北時區計算擷取日期（YYYY-MM-DD）。 */
export function capturedAtOf(date: Date): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Taipei' }).format(
    date
  );
}

/** HTTP 狀態碼對應的中文說明。 */
function httpMessage(status: number): string {
  if (status === 403)
    return `無法讀取試算表（HTTP 403）：請確認服務帳號已被分享為檢視者`;
  if (status === 404) return `找不到試算表（HTTP 404）：請確認 spreadsheetId`;
  return `讀取試算表失敗（HTTP ${status}）`;
}

/** 以權杖呼叫 Sheets API，將網路與 HTTP 錯誤轉為 SnapshotFetchError。 */
async function getJson(
  url: string,
  token: string,
  deps: FetchDeps
): Promise<unknown> {
  let response: Response;
  try {
    response = await deps.fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    throw new SnapshotFetchError(
      `無法連線到 Google Sheets：${(error as Error).message}`
    );
  }
  if (!response.ok) throw new SnapshotFetchError(httpMessage(response.status));
  return response.json();
}

/** 取得存取權杖；失敗時轉為 SnapshotFetchError。 */
async function tokenOf(deps: FetchDeps): Promise<string> {
  try {
    return await deps.getToken();
  } catch (error) {
    throw new SnapshotFetchError(
      `無法取得讀取授權：${(error as Error).message}`
    );
  }
}

/** 由中繼資料取得四個分頁的 sheetId；缺分頁時拋錯。 */
function sheetIdsOf(
  meta: unknown,
  config: SnapshotConfig
): Record<Group, number> {
  const sheets =
    (meta as { sheets?: { properties: { title: string; sheetId: number } }[] })
      .sheets ?? [];
  const byTitle = new Map(
    sheets.map(s => [s.properties.title, s.properties.sheetId])
  );
  return Object.fromEntries(
    GROUPS.map(group => {
      const title = config.sheets[group].title;
      const id = byTitle.get(title);
      if (id === undefined)
        throw new SnapshotFetchError(`試算表中找不到分頁「${title}」`);
      return [group, id];
    })
  ) as Record<Group, number>;
}

/** A1 範圍：分頁名稱加上引號（單引號重複以跳脫）。 */
function rangeOf(title: string): string {
  return `'${title.replaceAll("'", "''")}'!A:O`;
}

/** batchGet 讀取四個分頁的 values（依 GROUPS 順序）。 */
async function readValues(
  config: SnapshotConfig,
  token: string,
  deps: FetchDeps
) {
  const params = new URLSearchParams({
    valueRenderOption: 'FORMATTED_VALUE',
    majorDimension: 'ROWS',
  });
  GROUPS.forEach(group =>
    params.append('ranges', rangeOf(config.sheets[group].title))
  );
  const url = `${API}/${encodeURIComponent(config.spreadsheetId)}/values:batchGet?${params}`;
  const body = (await getJson(url, token, deps)) as {
    valueRanges?: { values?: string[][] }[];
  };
  return GROUPS.map((_, i) => body.valueRanges?.[i]?.values ?? []);
}

/**
 * 以唯讀權杖讀取工作表四個分頁並組成快照 v2（spec FR-001、FR-003；plan ADR-001、ADR-002）。
 * @throws {SnapshotFetchError} 無法讀取時
 * @throws {SnapshotBuildError} 資料不合規則時（訊息含分頁、列號、原值；由逐列解析拋出）
 */
export async function fetchSnapshot(
  config: SnapshotConfig,
  deps: FetchDeps,
  warn: WarningHandler
): Promise<Snapshot> {
  const token = await tokenOf(deps);
  const meta = await getJson(
    `${API}/${encodeURIComponent(config.spreadsheetId)}?fields=sheets.properties(sheetId,title)`,
    token,
    deps
  );
  const sheetIds = sheetIdsOf(meta, config);
  const values = await readValues(config, token, deps);
  const sheets = Object.fromEntries(
    GROUPS.map((group, i) => [
      group,
      { sheetId: sheetIds[group], ...parseSheetRows(values[i], group, warn) },
    ])
  );
  const snapshot = {
    schemaVersion: 2,
    capturedAt: capturedAtOf(deps.now()),
    spreadsheetId: config.spreadsheetId,
    sheets,
  };
  return parseSnapshot(snapshot);
}

/** 讀取設定並取得快照；警告收集到陣列並輸出到主控台。 */
async function readSnapshot(cwd: string, deps: FetchDeps, warnings: string[]) {
  const config = parseConfig(
    JSON.parse(readFileSync(join(cwd, 'data', 'snapshot.config.json'), 'utf8'))
  );
  return fetchSnapshot(config, deps, message => {
    warnings.push(message);
    console.warn(`警告：${message}`);
  });
}

/**
 * CLI：讀取工作表並寫出 `data/snapshot.json`（失敗時不寫）；不論成敗都寫出 `update-report.json`。
 * @returns 結束碼：成功 0，失敗 1
 */
export async function main(
  cwd: string,
  deps: FetchDeps,
  options: { trigger: Trigger } = { trigger: 'manual' }
): Promise<number> {
  const startedAt = deps.now().toISOString();
  const warnings: string[] = [];
  let snapshot: Snapshot | null = null;
  const errors: string[] = [];
  try {
    snapshot = await readSnapshot(cwd, deps, warnings);
    mkdirSync(join(cwd, 'data'), { recursive: true });
    writeFileSync(
      join(cwd, 'data', 'snapshot.json'),
      `${JSON.stringify(snapshot, null, 2)}\n`
    );
    const counts = GROUPS.map(
      g => `${g} ${snapshot!.sheets[g].rows.length}`
    ).join('、');
    console.log(
      `已輸出 data/snapshot.json（${snapshot.capturedAt}）：${counts} 件`
    );
  } catch (error) {
    errors.push((error as Error).message);
    console.error((error as Error).message);
  }
  const report = createReport({
    trigger: options.trigger,
    startedAt,
    finishedAt: deps.now().toISOString(),
    snapshot,
    warnings,
    errors,
  });
  writeFileSync(join(cwd, REPORT_FILE), `${JSON.stringify(report, null, 2)}\n`);
  return errors.length ? 1 : 0;
}

/* istanbul ignore next -- CLI 進入點：實際連線 Google */
if (require.main === module) {
  import('./googleToken').then(async ({ tokenFromEnv }) => {
    process.exitCode = await main(
      process.cwd(),
      { fetch, getToken: tokenFromEnv(process.env), now: () => new Date() },
      { trigger: triggerOf(process.env.GITHUB_EVENT_NAME) }
    );
  });
}
