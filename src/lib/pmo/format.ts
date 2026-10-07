/**
 * 將 YYYY-MM-DD 顯示為 YYYY/MM/DD；空值顯示「—」，其他格式（如原表的 12/31）保留原文。
 */
export function formatDate(value: string | null): string {
  if (!value) return '—';
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value.replaceAll('-', '/') : value;
}
