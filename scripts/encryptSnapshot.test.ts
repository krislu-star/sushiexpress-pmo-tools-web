/**
 * @jest-environment node
 */
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { decryptSnapshot } from '@/lib/pmo/crypto';
import { readPageData } from '@/lib/pmo/pageData';
import { main, PAGE_DATA_FILE } from './encryptSnapshot';

const FIXTURE = join(__dirname, '../tests/fixtures/snapshot.sample.json');

function workspace(withSnapshot = true) {
  const dir = mkdtempSync(join(tmpdir(), 'enc-'));
  mkdirSync(join(dir, 'data'));
  if (withSnapshot) copyFileSync(FIXTURE, join(dir, 'data', 'snapshot.json'));
  return dir;
}

describe('snapshot:encrypt（plan ADR-003）', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());

  it('有密碼時寫出只含密文的頁面資料，三頁共用同一份', async () => {
    const dir = workspace();
    expect(await main(dir, { PMO_ACCESS_PASSWORD: 'pw' })).toBe(0);
    const raw = readFileSync(join(dir, PAGE_DATA_FILE), 'utf8');
    expect(raw).not.toContain('POS優化');
    const data = readPageData(dir);
    expect('encrypted' in data).toBe(true);
    if ('encrypted' in data) {
      await expect(
        decryptSnapshot(data.encrypted, 'pw')
      ).resolves.toMatchObject({ capturedAt: '2026-09-15' });
    }
  });

  it('可用 PMO_SNAPSHOT 指定快照', async () => {
    const dir = workspace(false);
    expect(
      await main(dir, { PMO_ACCESS_PASSWORD: 'pw', PMO_SNAPSHOT: FIXTURE })
    ).toBe(0);
  });

  it('只有明確設定 PMO_ALLOW_PLAINTEXT=1 時才輸出明文（僅本機）', async () => {
    const dir = workspace();
    expect(await main(dir, { PMO_ALLOW_PLAINTEXT: '1' })).toBe(0);
    const data = readPageData(dir);
    expect('plaintext' in data && data.plaintext.capturedAt).toBe('2026-09-15');
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('明文'));
  });

  it('未設定密碼、CI 環境要求明文、或找不到快照時失敗並說明', async () => {
    expect(await main(workspace(), {})).toBe(1);
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('PMO_ACCESS_PASSWORD')
    );
    expect(
      await main(workspace(), { PMO_ALLOW_PLAINTEXT: '1', CI: 'true' })
    ).toBe(1);
    expect(await main(workspace(false), { PMO_ACCESS_PASSWORD: 'pw' })).toBe(1);
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('snapshot:fetch')
    );
  });
});

describe('readPageData', () => {
  it('檔案不存在或格式錯誤時拋錯並說明', () => {
    expect(() => readPageData(workspace())).toThrow(/snapshot:encrypt/);
  });
});
