import { moveBy, reorder } from './reorder';

describe('reorder', () => {
  const list = ['a', 'b', 'c', 'd'];

  it('將項目移到指定位置', () => {
    expect(reorder(list, 'a', 2)).toEqual(['b', 'c', 'a', 'd']);
    expect(reorder(list, 'd', 0)).toEqual(['d', 'a', 'b', 'c']);
  });

  it('位置超出範圍時夾限到頭尾', () => {
    expect(reorder(list, 'b', -3)).toEqual(['b', 'a', 'c', 'd']);
    expect(reorder(list, 'b', 99)).toEqual(['a', 'c', 'd', 'b']);
  });

  it('項目不存在時回傳原順序的新陣列', () => {
    const result = reorder(list, 'x', 1);
    expect(result).toEqual(list);
    expect(result).not.toBe(list);
  });
});

describe('moveBy', () => {
  it('上下移動一格，到頭尾時不動', () => {
    expect(moveBy(['a', 'b', 'c'], 'b', -1)).toEqual(['b', 'a', 'c']);
    expect(moveBy(['a', 'b', 'c'], 'b', 1)).toEqual(['a', 'c', 'b']);
    expect(moveBy(['a', 'b', 'c'], 'a', -1)).toEqual(['a', 'b', 'c']);
  });
});
