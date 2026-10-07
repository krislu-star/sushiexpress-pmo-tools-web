/**
 * @jest-environment node
 */
import { parseSnapshot } from '@/lib/pmo/snapshotSchema';
import { makeSynthetic } from './makeSynthetic';

describe('makeSynthetic', () => {
  it('產生指定件數、平均分配到四組且通過 schema', () => {
    const snap = parseSnapshot(makeSynthetic(500));
    const counts = Object.values(snap.sheets).map(s => s.rows.length);
    expect(counts.reduce((a, b) => a + b, 0)).toBe(500);
    expect(Math.max(...counts) - Math.min(...counts)).toBeLessThanOrEqual(1);
  });

  it('含 Progress 與燈號樣本（含空白）', () => {
    const rows = Object.values(makeSynthetic(24).sheets).flatMap(s => s.rows);
    expect(rows.some(r => r.values[13] === '')).toBe(true);
    expect(rows.some(r => /%$/.test(r.values[13]))).toBe(true);
    expect(rows.some(r => r.values[14] === '')).toBe(true);
    expect(rows.some(r => r.values[14] === '🔴 紅燈')).toBe(true);
  });

  it('件數不能被 4 整除時，多出的件數依序分給前面的組', () => {
    const counts = Object.values(makeSynthetic(6).sheets).map(
      s => s.rows.length
    );
    expect(counts).toEqual([2, 2, 1, 1]);
  });

  it('列號遞增且內容可重現', () => {
    const a = makeSynthetic(8);
    expect(a.sheets.SAP.rows.map(r => r.sourceRow)).toEqual([2, 3]);
    expect(makeSynthetic(8)).toEqual(a);
  });
});
