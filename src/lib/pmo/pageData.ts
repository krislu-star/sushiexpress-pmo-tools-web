import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseEncrypted, type EncryptedSnapshot } from './crypto';
import { parseSnapshot, type Snapshot } from './snapshotSchema';

/** 建置前加密步驟寫出的頁面資料位置（相對於專案根目錄）。 */
export const PAGE_DATA_FILE = '.pmo/page-data.json';

/** 頁面資料：正式為密文；僅本機可為明文（PMO_ALLOW_PLAINTEXT=1）。 */
export type PageData =
  | { encrypted: EncryptedSnapshot }
  | { plaintext: Snapshot };

/**
 * 讀取並驗證頁面資料（只在建置時的 getStaticProps 使用，不進瀏覽器 bundle）。
 * @throws 檔案不存在或格式錯誤時，提示先執行 snapshot:encrypt
 */
export function readPageData(cwd: string): PageData {
  try {
    const raw = JSON.parse(readFileSync(join(cwd, PAGE_DATA_FILE), 'utf8'));
    return 'encrypted' in raw
      ? { encrypted: parseEncrypted(raw.encrypted) }
      : { plaintext: parseSnapshot(raw.plaintext) };
  } catch (error) {
    throw new Error(
      `無法讀取 ${PAGE_DATA_FILE}：請先執行 pnpm snapshot:encrypt（${(error as Error).message}）`
    );
  }
}
