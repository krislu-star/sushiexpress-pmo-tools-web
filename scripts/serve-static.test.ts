/**
 * @jest-environment node
 */
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { resolveFile, serve } from './serve-static';

const root = mkdtempSync(join(tmpdir(), 'out-'));
writeFileSync(join(root, 'tracker.html'), '<h1>t</h1>');
mkdirSync(join(root, '_next'));
writeFileSync(join(root, '_next', 'a.js'), 'x');
writeFileSync(join(root, 'data.bin'), 'x');

describe('resolveFile', () => {
  it('無副檔名路徑對應到 .html', () => {
    expect(resolveFile(root, '/tracker?x=1')).toBe(join(root, 'tracker.html'));
  });
  it('直接對應靜態檔', () => {
    expect(resolveFile(root, '/_next/a.js')).toBe(join(root, '_next', 'a.js'));
  });
  it('不存在或越界時回傳 null', () => {
    expect(resolveFile(root, '/nope')).toBeNull();
    expect(resolveFile(root, '/../etc/passwd')).toBeNull();
    expect(resolveFile(root, '/_next')).toBeNull();
  });
});

describe('serve', () => {
  it('回傳檔案並帶禁止行內腳本的 CSP；找不到時 404', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    const server = serve(root, 0);
    await new Promise(r => server.once('listening', r));
    const { port } = server.address() as AddressInfo;
    const ok = await fetch(`http://localhost:${port}/tracker`);
    expect(ok.status).toBe(200);
    expect(ok.headers.get('content-type')).toContain('text/html');
    expect(ok.headers.get('content-security-policy')).toContain(
      "script-src 'self'"
    );
    const bin = await fetch(`http://localhost:${port}/data.bin`);
    expect(bin.headers.get('content-type')).toBe('application/octet-stream');
    expect((await fetch(`http://localhost:${port}/missing`)).status).toBe(404);
    server.close();
  });
});
