import { paginate } from './paginate';

describe('paginate', () => {
  it('依每頁件數切分', () => {
    expect(paginate([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    expect(paginate([1, 2, 3, 4, 5, 6], 3)).toEqual([
      [1, 2, 3],
      [4, 5, 6],
    ]);
  });

  it('空陣列回傳一頁空頁（預覽仍顯示報告框架）', () => {
    expect(paginate([], 2)).toEqual([[]]);
  });

  it('每頁件數需為正整數', () => {
    expect(() => paginate([1], 0)).toThrow(RangeError);
    expect(() => paginate([1], 1.5)).toThrow(RangeError);
  });
});
