import { caseWith } from '../../../tests/factories';
import { compareValues, isMissing, sortCases } from './sortCases';

const ids = (list: { id: string }[]) => list.map(c => c.id);

describe('sortCases', () => {
  const cases = [
    caseWith({
      id: 'a',
      order: 0,
      title: '案件10',
      progress: 30,
      owner: '未提供',
    }),
    caseWith({
      id: 'b',
      order: 1,
      title: '案件2',
      progress: null,
      owner: 'Tim',
    }),
    caseWith({ id: 'c', order: 2, title: '案件1', progress: 80, owner: '' }),
    caseWith({ id: 'd', order: 3, title: '案件2', progress: 30, owner: 'Amy' }),
  ];

  it('升冪：中文自然排序（數字依數值），同值依原表順序', () => {
    expect(ids(sortCases(cases, 'title', 'asc'))).toEqual(['c', 'b', 'd', 'a']);
  });

  it('降冪：同值仍依原表順序', () => {
    expect(ids(sortCases(cases, 'title', 'desc'))).toEqual([
      'a',
      'b',
      'd',
      'c',
    ]);
  });

  it('數字欄位依數值排序，null 不論升降冪都排最後', () => {
    expect(ids(sortCases(cases, 'progress', 'asc'))).toEqual([
      'a',
      'd',
      'c',
      'b',
    ]);
    expect(ids(sortCases(cases, 'progress', 'desc'))).toEqual([
      'c',
      'a',
      'd',
      'b',
    ]);
  });

  it('缺值（空字串、未提供、—）排最後，缺值之間依原表順序', () => {
    const withDash = [...cases, caseWith({ id: 'e', order: 4, owner: '—' })];
    expect(ids(sortCases(withDash, 'owner', 'asc'))).toEqual([
      'd',
      'b',
      'a',
      'c',
      'e',
    ]);
    expect(ids(sortCases(withDash, 'owner', 'desc'))).toEqual([
      'b',
      'd',
      'a',
      'c',
      'e',
    ]);
  });

  it('全部缺值（如更新日期）時維持原表順序', () => {
    expect(ids(sortCases([...cases].reverse(), 'updated', 'asc'))).toEqual([
      'a',
      'b',
      'c',
      'd',
    ]);
  });

  it('order 欄位即回到原表順序', () => {
    expect(ids(sortCases([...cases].reverse(), 'order', 'asc'))).toEqual([
      'a',
      'b',
      'c',
      'd',
    ]);
  });

  it('不分大小寫比較並回傳新陣列', () => {
    const list = [
      caseWith({ id: 'x', order: 0, owner: 'bob' }),
      caseWith({ id: 'y', order: 1, owner: 'Alice' }),
    ];
    const sorted = sortCases(list, 'owner', 'asc');
    expect(ids(sorted)).toEqual(['y', 'x']);
    expect(sorted).not.toBe(list);
    expect(ids(list)).toEqual(['x', 'y']);
  });
});

describe('isMissing / compareValues', () => {
  it('判斷缺值', () => {
    expect([null, undefined, '', ' ', '未提供', '—'].every(isMissing)).toBe(
      true
    );
    expect([0, 'x', '0'].some(isMissing)).toBe(false);
  });

  it('數字依數值、文字依自然排序比較', () => {
    expect(compareValues(10, 9)).toBeGreaterThan(0);
    expect(compareValues('案件10', '案件9')).toBeGreaterThan(0);
  });
});
