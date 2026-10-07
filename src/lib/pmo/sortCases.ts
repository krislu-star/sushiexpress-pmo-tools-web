import { NOT_PROVIDED, type Case } from './cases';

/** 可排序的案件欄位。 */
export type SortKey =
  | 'order'
  | 'title'
  | 'project'
  | 'category'
  | 'group'
  | 'owner'
  | 'status'
  | 'progress'
  | 'latest'
  | 'updated'
  | 'bpmId'
  | 'due';

/** 排序方向。 */
export type SortDirection = 'asc' | 'desc';

const MISSING = new Set(['', NOT_PROVIDED, '—']);

/** 判斷是否為缺值：null、空字串、「未提供」、「—」。 */
export function isMissing(value: unknown): boolean {
  return (
    value === null || value === undefined || MISSING.has(String(value).trim())
  );
}

const collator = new Intl.Collator('zh-Hant', {
  numeric: true,
  sensitivity: 'base',
});

/** 比較兩個非缺值：數字依數值，其餘採中文自然排序。 */
export function compareValues(a: unknown, b: unknown): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return collator.compare(String(a), String(b));
}

/**
 * 依欄位排序案件（spec FR-005）。缺值不論升降冪都排最後；同值依原表順序。
 * @returns 新陣列，不改變輸入
 */
export function sortCases<T extends Pick<Case, 'order'>>(
  cases: readonly T[],
  key: keyof T,
  direction: SortDirection
): T[] {
  const sign = direction === 'asc' ? 1 : -1;
  return [...cases].sort((x, y) => {
    const a = x[key];
    const b = y[key];
    const missing = Number(isMissing(a)) - Number(isMissing(b));
    if (missing) return missing;
    const diff = isMissing(a) ? 0 : compareValues(a, b) * sign;
    return diff || x.order - y.order;
  });
}
