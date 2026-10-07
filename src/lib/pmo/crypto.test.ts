/**
 * @jest-environment node
 */
import sample from '../../../tests/fixtures/snapshot.sample.json';
import {
  DecryptError,
  decryptSnapshot,
  decryptWithKey,
  deriveKey,
  encryptSnapshot,
  exportSessionKey,
  importSessionKey,
  ITERATIONS,
  parseEncrypted,
} from './crypto';
import { parseSnapshot } from './snapshotSchema';

const snapshot = parseSnapshot(sample);

describe('加密與解密（plan ADR-003；contracts/encrypted-snapshot.schema.json）', () => {
  let encrypted: Awaited<ReturnType<typeof encryptSnapshot>>;
  beforeAll(async () => {
    encrypted = await encryptSnapshot(snapshot, 'correct horse');
  });

  it('格式符合契約：PBKDF2-SHA256 600,000 次、AES-GCM', () => {
    expect(ITERATIONS).toBe(600000);
    expect(parseEncrypted(encrypted)).toEqual(encrypted);
    expect(encrypted.kdf).toMatchObject({
      name: 'PBKDF2',
      hash: 'SHA-256',
      iterations: 600000,
    });
    expect(encrypted.kdf.salt).toMatch(/^[A-Za-z0-9+/]{22}==$/);
    expect(encrypted.cipher.iv).toMatch(/^[A-Za-z0-9+/]{16}$/);
  });

  it('密文不含任何明文案件資料（SC-006）', () => {
    const text = JSON.stringify(encrypted);
    for (const needle of ['POS優化', 'StevenC', '統智', 'Frontend'])
      expect(text).not.toContain(needle);
  });

  it('正確密碼解密後與原快照相同', async () => {
    await expect(decryptSnapshot(encrypted, 'correct horse')).resolves.toEqual(
      snapshot
    );
  });

  it('密碼錯誤時拋出 DecryptError「密碼不正確」（SC-008）', async () => {
    await expect(decryptSnapshot(encrypted, 'wrong')).rejects.toThrow(
      DecryptError
    );
    await expect(decryptSnapshot(encrypted, 'wrong')).rejects.toThrow(
      '密碼不正確'
    );
  });

  it('每次加密的 salt 與 IV 都不同（更換密碼或重建後舊金鑰失效）', async () => {
    const again = await encryptSnapshot(snapshot, 'correct horse');
    expect(again.kdf.salt).not.toBe(encrypted.kdf.salt);
    expect(again.cipher.iv).not.toBe(encrypted.cipher.iv);
    expect(again.data).not.toBe(encrypted.data);
  });

  it('衍生金鑰可匯出為 session 金鑰並匯入後解密；salt 不符時匯入結果為 null', async () => {
    const key = await deriveKey('correct horse', encrypted);
    const session = await exportSessionKey(key, encrypted);
    expect(session.salt).toBe(encrypted.kdf.salt);
    expect(JSON.stringify(session)).not.toContain('correct horse');
    const imported = await importSessionKey(session, encrypted);
    await expect(decryptWithKey(encrypted, imported!)).resolves.toEqual(
      snapshot
    );
    const other = await encryptSnapshot(snapshot, 'correct horse');
    await expect(importSessionKey(session, other)).resolves.toBeNull();
  });

  it('資料被竄改時無法解密', async () => {
    const tampered = { ...encrypted, data: `A${encrypted.data.slice(1)}` };
    await expect(decryptSnapshot(tampered, 'correct horse')).rejects.toThrow(
      DecryptError
    );
  });

  it('格式不符時 parseEncrypted 拋錯；session 金鑰格式錯誤時回傳 null', async () => {
    expect(() => parseEncrypted({ version: 1 })).toThrow();
    expect(() =>
      parseEncrypted({
        ...encrypted,
        kdf: { ...encrypted.kdf, iterations: 1000 },
      })
    ).toThrow();
    await expect(
      importSessionKey({ salt: encrypted.kdf.salt, key: '!!!' }, encrypted)
    ).resolves.toBeNull();
  });
});
