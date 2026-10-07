import {
  LIGHT_LABELS,
  LIGHTS,
  parseLight,
  parseProgress,
  SheetFieldError,
} from './sheetFields';

describe('parseProgress（原表 Progress 欄）', () => {
  it.each([
    ['90%', 90],
    ['90', 90],
    [' 0% ', 0],
    ['100%', 100],
    ['', null],
    ['  ', null],
  ])('「%s」→ %p', (raw, expected) => {
    expect(parseProgress(raw)).toBe(expected);
  });

  it.each(['0.9', '101%', '-5%', '約九成', '90 %%', '9O%'])(
    '「%s」無法辨識時拋出 SheetFieldError',
    raw => {
      expect(() => parseProgress(raw)).toThrow(SheetFieldError);
    }
  );
});

describe('parseLight（原表燈號欄）', () => {
  it.each([
    ['🔴 紅燈', 'red'],
    ['🟡 黃燈', 'yellow'],
    ['🟢 綠燈', 'green'],
    ['⚪ 待評估', 'gray'],
    ['紅燈', 'red'],
    [' 綠燈 ', 'green'],
    ['🟡', 'yellow'],
    ['', 'gray'],
  ])('「%s」→ %s', (raw, expected) => {
    expect(parseLight(raw)).toBe(expected);
  });

  it.each(['藍燈', 'OK', '🔵'])('「%s」無法辨識時拋出 SheetFieldError', raw => {
    expect(() => parseLight(raw)).toThrow(SheetFieldError);
  });

  it('燈號順序與顯示文字', () => {
    expect(LIGHTS).toEqual(['red', 'yellow', 'gray', 'green']);
    expect(LIGHT_LABELS.yellow).toBe('🟡 黃燈');
  });

  it('錯誤訊息包含原始值', () => {
    expect(() => parseLight('藍燈')).toThrow(/藍燈/);
    expect(() => parseProgress('約九成')).toThrow(/約九成/);
  });
});
