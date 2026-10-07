/**
 * 將項目依每頁件數切成多頁（A4 呈報：專案每頁 2 件、案件每頁 3 件）。
 * 沒有項目時回傳一頁空頁，讓預覽仍顯示報告框架。
 * @throws {RangeError} 每頁件數不是正整數時
 */
export function paginate<T>(items: readonly T[], perPage: number): T[][] {
  if (!Number.isInteger(perPage) || perPage < 1) {
    throw new RangeError(`每頁件數必須為正整數：${perPage}`);
  }
  const pageCount = Math.max(1, Math.ceil(items.length / perPage));
  return Array.from({ length: pageCount }, (_, page) =>
    items.slice(page * perPage, (page + 1) * perPage)
  );
}
