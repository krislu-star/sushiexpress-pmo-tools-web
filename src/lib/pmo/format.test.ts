import { formatDate } from './format';

describe('formatDate', () => {
  it('YYYY-MM-DD 轉為 YYYY/MM/DD', () => {
    expect(formatDate('2026-09-15')).toBe('2026/09/15');
  });
  it('空值顯示 —，非 ISO 日期保留原文', () => {
    expect(formatDate(null)).toBe('—');
    expect(formatDate('')).toBe('—');
    expect(formatDate('12/31')).toBe('12/31');
  });
});
