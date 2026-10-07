import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

/**
 * 將請求路徑對應到靜態輸出目錄中的檔案；`/tracker` 對應 `tracker.html`。
 * @returns 檔案路徑；不存在或越界時回傳 null
 */
export function resolveFile(root: string, urlPath: string): string | null {
  const clean = normalize(decodeURIComponent(urlPath.split('?')[0]));
  if (clean.includes('..')) return null;
  const base = join(root, clean);
  const candidates = [base, `${base}.html`, join(base, 'index.html')];
  return candidates.find(p => existsSync(p) && statSync(p).isFile()) ?? null;
}

/**
 * 以與 BPM 相近的方式提供 `out/`：只送靜態檔，並加上禁止行內腳本的 CSP，
 * 讓 E2E 能及早發現依賴行內程式的退化（plan ADR-002）。
 */
export function serve(root: string, port: number) {
  return createServer((req, res) => {
    const file = resolveFile(root, req.url as string);
    if (!file) {
      res.writeHead(404).end('Not Found');
      return;
    }
    res.writeHead(200, {
      'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream',
      'Content-Security-Policy':
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:",
    });
    createReadStream(file).pipe(res);
  }).listen(port, () => console.log(`serving ${root} on :${port}`));
}

/* istanbul ignore next -- CLI 進入點 */
if (require.main === module) {
  serve(process.argv[2] ?? 'out', Number(process.argv[3]) || 4173);
}
