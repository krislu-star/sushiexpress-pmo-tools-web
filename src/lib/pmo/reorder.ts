/**
 * 將項目移到指定位置（呈報排序，spec FR-012）。位置超出範圍時夾限到頭尾；
 * 項目不存在時回傳原順序。
 * @returns 新陣列，不改變輸入
 */
export function reorder<T>(items: readonly T[], item: T, index: number): T[] {
  if (!items.includes(item)) return [...items];
  const rest = items.filter(x => x !== item);
  const target = Math.max(0, Math.min(rest.length, index));
  return [...rest.slice(0, target), item, ...rest.slice(target)];
}

/** 將項目上移（-1）或下移（+1）一格；到頭尾時不動。 */
export function moveBy<T>(items: readonly T[], item: T, delta: number): T[] {
  return reorder(items, item, items.indexOf(item) + delta);
}
