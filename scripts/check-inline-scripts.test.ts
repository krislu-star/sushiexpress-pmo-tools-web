/**
 * @jest-environment node
 */
import { findInlineScriptViolations } from './check-inline-scripts';

describe('findInlineScriptViolations', () => {
  it('允許外部腳本與 JSON 資料區塊', () => {
    const html = `<html><head>
      <script src="/_next/static/chunks/main.js" defer=""></script>
      <script id="__NEXT_DATA__" type="application/json">{"props":{}}</script>
      <script src="/a.js" nomodule=""></script>
    </head><body><div id="__next"></div></body></html>`;
    expect(findInlineScriptViolations(html)).toEqual([]);
  });

  it('偵測有內容的行內腳本', () => {
    const html = '<body><script>self.__next_f.push([0])</script></body>';
    expect(findInlineScriptViolations(html)).toEqual([
      expect.stringContaining('行內腳本'),
    ]);
  });

  it('偵測 type="text/javascript" 或 module 的行內腳本', () => {
    const html =
      '<script type="text/javascript">a()</script><script type="module">b()</script>';
    expect(findInlineScriptViolations(html)).toHaveLength(2);
  });

  it('只有空白的 script 不算違規', () => {
    expect(
      findInlineScriptViolations('<script src="x.js">  \n</script>')
    ).toEqual([]);
  });

  it('偵測行內事件處理屬性', () => {
    const html = '<button onclick="go()">x</button><img src="a" onerror="x()">';
    expect(findInlineScriptViolations(html)).toEqual([
      expect.stringContaining('onclick'),
      expect.stringContaining('onerror'),
    ]);
  });

  it('偵測 javascript: 連結', () => {
    const html = '<a href="javascript:alert(1)">x</a>';
    expect(findInlineScriptViolations(html)).toEqual([
      expect.stringContaining('javascript:'),
    ]);
  });

  it('文字內容中的 onclick 字樣不算違規', () => {
    expect(findInlineScriptViolations('<p>請勿使用 onclick= 屬性</p>')).toEqual(
      []
    );
  });
});

describe('main', () => {
  const { mkdtempSync, writeFileSync } = jest.requireActual('node:fs');
  const { tmpdir } = jest.requireActual('node:os');
  const { join } = jest.requireActual('node:path');

  function dirWith(files: Record<string, string>): string {
    const dir = mkdtempSync(join(tmpdir(), 'inline-'));
    Object.entries(files).forEach(([n, c]) => writeFileSync(join(dir, n), c));
    return dir;
  }

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());

  it('全部通過時回傳 0，並略過非 HTML 檔', () => {
    const { main } = jest.requireActual('./check-inline-scripts');
    const dir = dirWith({
      'a.html': '<script src="a.js"></script>',
      'a.js': 'alert(1)',
    });
    expect(main(dir)).toBe(0);
  });

  it('有違規時回傳 1 並列出檔名', () => {
    const { main } = jest.requireActual('./check-inline-scripts');
    const dir = dirWith({ 'bad.html': '<script>x()</script>' });
    expect(main(dir)).toBe(1);
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('bad.html')
    );
  });
});
