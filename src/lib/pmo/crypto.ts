import { z } from 'zod';
import { parseSnapshot, type Snapshot } from './snapshotSchema';

/** PBKDF2 次數（plan ADR-003）。 */
export const ITERATIONS = 600_000;

const encryptedSchema = z
  .object({
    version: z.literal(1),
    kdf: z
      .object({
        name: z.literal('PBKDF2'),
        hash: z.literal('SHA-256'),
        iterations: z.number().int().min(ITERATIONS),
        salt: z.string().regex(/^[A-Za-z0-9+/]{22}==$/),
      })
      .strict(),
    cipher: z
      .object({
        name: z.literal('AES-GCM'),
        iv: z.string().regex(/^[A-Za-z0-9+/]{16}$/),
      })
      .strict(),
    data: z.string().min(24),
  })
  .strict();

/** 加密後的快照；與 contracts/encrypted-snapshot.schema.json 一致。 */
export type EncryptedSnapshot = z.infer<typeof encryptedSchema>;

/** 存於 sessionStorage 的衍生金鑰（不含密碼）。 */
export interface SessionKey {
  salt: string;
  key: string;
}

/** 密碼錯誤或資料無法解密時拋出。 */
export class DecryptError extends Error {
  override name = 'DecryptError';
  constructor() {
    super('密碼不正確');
  }
}

/** 驗證加密資料格式。 */
export function parseEncrypted(data: unknown): EncryptedSnapshot {
  return encryptedSchema.parse(data);
}

/** 位元組轉 base64（分段避免大量資料超出呼叫堆疊）。 */
function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

/** base64 轉位元組。 */
function fromBase64(text: string): Uint8Array {
  return Uint8Array.from(atob(text), c => c.charCodeAt(0));
}

/**
 * 由密碼與加密資料中的 salt 衍生 AES-256-GCM 金鑰（可匯出，供同分頁共用）。
 */
export async function deriveKey(
  password: string,
  encrypted: EncryptedSnapshot
): Promise<CryptoKey> {
  const subtle = globalThis.crypto.subtle;
  const base = await subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return subtle.deriveKey(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      iterations: encrypted.kdf.iterations,
      salt: fromBase64(encrypted.kdf.salt),
    },
    base,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * 以共用密碼加密快照（建置時使用；spec FR-007）。每次產生新的 salt 與 IV。
 */
export async function encryptSnapshot(
  snapshot: Snapshot,
  password: string
): Promise<EncryptedSnapshot> {
  const salt = toBase64(globalThis.crypto.getRandomValues(new Uint8Array(16)));
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const header = {
    version: 1 as const,
    kdf: {
      name: 'PBKDF2' as const,
      hash: 'SHA-256' as const,
      iterations: ITERATIONS,
      salt,
    },
    cipher: { name: 'AES-GCM' as const, iv: toBase64(iv) },
  };
  const key = await deriveKey(password, { ...header, data: '' });
  const plain = new TextEncoder().encode(JSON.stringify(snapshot));
  const cipher = await globalThis.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    plain
  );
  return { ...header, data: toBase64(new Uint8Array(cipher)) };
}

/**
 * 以金鑰解密並驗證快照。
 * @throws {DecryptError} 金鑰不符或資料遭竄改時
 */
export async function decryptWithKey(
  encrypted: EncryptedSnapshot,
  key: CryptoKey
): Promise<Snapshot> {
  try {
    const plain = await globalThis.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: fromBase64(encrypted.cipher.iv) },
      key,
      fromBase64(encrypted.data)
    );
    return parseSnapshot(JSON.parse(new TextDecoder().decode(plain)));
  } catch {
    throw new DecryptError();
  }
}

/**
 * 以密碼解密快照（spec SC-007、SC-008）。
 * @throws {DecryptError} 密碼不正確時
 */
export async function decryptSnapshot(
  encrypted: EncryptedSnapshot,
  password: string
): Promise<Snapshot> {
  return decryptWithKey(encrypted, await deriveKey(password, encrypted));
}

/** 匯出衍生金鑰供 sessionStorage 保存（不含密碼）。 */
export async function exportSessionKey(
  key: CryptoKey,
  encrypted: EncryptedSnapshot
): Promise<SessionKey> {
  const raw = await globalThis.crypto.subtle.exportKey('raw', key);
  return { salt: encrypted.kdf.salt, key: toBase64(new Uint8Array(raw)) };
}

/**
 * 匯入 sessionStorage 保存的金鑰；salt 與目前資料不同（已重建或更換密碼）或格式錯誤時回傳 null。
 */
export async function importSessionKey(
  session: SessionKey,
  encrypted: EncryptedSnapshot
): Promise<CryptoKey | null> {
  if (session.salt !== encrypted.kdf.salt) return null;
  try {
    return await globalThis.crypto.subtle.importKey(
      'raw',
      fromBase64(session.key),
      'AES-GCM',
      true,
      ['decrypt']
    );
  } catch {
    return null;
  }
}
