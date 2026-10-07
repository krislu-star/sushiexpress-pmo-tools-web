import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import {
  COLUMN,
  GROUPS,
  parseSnapshot,
  type Snapshot,
} from '../src/lib/pmo/snapshotSchema';

const CJK = /[㐀-鿿]/;
const SCANNED = new Set(['.html', '.js', '.json', '.txt']);

/** 足以代表案件資料的字串：含中文至少 2 字，或至少 6 字元（避免 Tim、Eric 等與程式碼撞名）。 */
function isDistinctive(text: string): boolean {
  return (CJK.test(text) && text.length >= 2) || text.length >= 6;
}

/** 取第一個非空行並去除前後空白。 */
function firstLine(text: string): string {
  return (
    text
      .split('\n')
      .map(l => l.trim())
      .find(Boolean) ?? ''
  );
}

/**
 * 由快照取出用來搜尋明文的字串：案件名稱、負責人、LOG 第一行前 12 字（spec SC-006）。
 */
export function needlesOf(snapshot: Snapshot): string[] {
  const values = GROUPS.flatMap(g =>
    snapshot.sheets[g].rows.map(r => r.values)
  );
  const candidates = values.flatMap(v => [
    firstLine(v[COLUMN.title]),
    v[COLUMN.owner].trim(),
    firstLine(v[COLUMN.log]).slice(0, 12),
  ]);
  return [...new Set(candidates.filter(isDistinctive))];
}

/** JSON 以 \uXXXX 跳脫後的寫法。 */
function escaped(text: string): string {
  return text.replace(
    /[\u0080-￿]/g,
    c => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`
  );
}

/** 回傳在內容中找到的明文字串（含 JSON 跳脫寫法）。 */
export function findPlaintext(
  content: string,
  needles: readonly string[]
): string[] {
  return needles.filter(
    n => content.includes(n) || content.includes(escaped(n))
  );
}

/** 遞迴列出要掃描的檔案。 */
function filesOf(dir: string): string[] {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return filesOf(path);
    return SCANNED.has(extname(name)) ? [path] : [];
  });
}

/**
 * 掃描產物目錄，確認不含快照明文（plan ADR-003）。
 * @returns 結束碼：未發現 0，發現 1
 */
export function main(dir: string, snapshot: Snapshot): number {
  const needles = needlesOf(snapshot);
  const problems = filesOf(dir).flatMap(file =>
    findPlaintext(readFileSync(file, 'utf8'), needles).map(
      n => `${relative(dir, file)}：${n}`
    )
  );
  problems.forEach(p => console.error(`發現明文 ${p}`));
  if (!problems.length)
    console.log(`已掃描 ${dir}，未發現明文（比對 ${needles.length} 個字串）`);
  return problems.length ? 1 : 0;
}

/* istanbul ignore next -- CLI 進入點：pnpm check:plaintext [out] [快照] */
if (require.main === module) {
  const snapshotPath =
    process.argv[3] ?? process.env.PMO_SNAPSHOT ?? 'data/snapshot.json';
  process.exitCode = main(
    process.argv[2] ?? 'out',
    parseSnapshot(JSON.parse(readFileSync(snapshotPath, 'utf8')))
  );
}
