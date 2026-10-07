import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const SCRIPT_TAG = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
const TAG = /<[a-z][^>]*>/gi;
const EVENT_ATTR = /\s(on[a-z]+)\s*=/gi;
const JS_URL = /\s(?:href|src|action|formaction)\s*=\s*["']?\s*javascript:/i;
const JSON_TYPE = /\btype\s*=\s*["']?application\/(?:ld\+)?json["']?/i;

/** 找出有內容且非 JSON 資料區塊的 `<script>`。 */
function inlineScripts(html: string): string[] {
  return [...html.matchAll(SCRIPT_TAG)]
    .filter(([, attrs, body]) => body.trim() !== '' && !JSON_TYPE.test(attrs))
    .map(([, , body]) => `行內腳本：${body.trim().slice(0, 60)}`);
}

/** 找出標籤上的行內事件處理屬性與 javascript: 連結（不檢查文字內容）。 */
function inlineHandlers(html: string): string[] {
  const tags = html.replace(SCRIPT_TAG, '').match(TAG) ?? [];
  return tags.flatMap(tag => [
    ...[...tag.matchAll(EVENT_ATTR)].map(m => `行內事件屬性 ${m[1]}：${tag}`),
    ...(JS_URL.test(tag) ? [`javascript: 連結：${tag}`] : []),
  ]);
}

/**
 * 檢查 HTML 是否含可執行的行內程式（plan ADR-002：產物不得依賴行內腳本）。
 * @param html 靜態輸出的 HTML 內容
 * @returns 違規描述清單；空陣列代表通過
 */
export function findInlineScriptViolations(html: string): string[] {
  return [...inlineScripts(html), ...inlineHandlers(html)];
}

/**
 * CLI：掃描指定目錄下的 `*.html`，有違規時列出並以結束碼 1 結束。
 * @param dir 靜態輸出目錄
 */
export function main(dir: string): number {
  const files = readdirSync(dir).filter(f => f.endsWith('.html'));
  const problems = files.flatMap(file =>
    findInlineScriptViolations(readFileSync(join(dir, file), 'utf8')).map(
      v => `${file}: ${v}`
    )
  );
  problems.forEach(p => console.error(p));
  console.log(`已檢查 ${files.length} 個 HTML，違規 ${problems.length} 項`);
  return problems.length ? 1 : 0;
}

/* istanbul ignore next -- CLI 進入點 */
if (require.main === module) {
  process.exitCode = main(process.argv[2] ?? 'out');
}
