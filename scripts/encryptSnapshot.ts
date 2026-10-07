import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { encryptSnapshot } from '../src/lib/pmo/crypto';
import { PAGE_DATA_FILE, type PageData } from '../src/lib/pmo/pageData';
import { parseSnapshot } from '../src/lib/pmo/snapshotSchema';

export { PAGE_DATA_FILE };

type Env = Record<string, string | undefined>;

/** 讀取快照（PMO_SNAPSHOT 或 data/snapshot.json）。 */
function readSnapshot(cwd: string, env: Env) {
  const path = resolve(cwd, env.PMO_SNAPSHOT ?? join('data', 'snapshot.json'));
  if (!existsSync(path)) {
    throw new Error(
      `找不到工作表快照 ${path}。請執行 pnpm snapshot:fetch（或 snapshot:build），或以 PMO_SNAPSHOT 指定測試快照`
    );
  }
  return parseSnapshot(JSON.parse(readFileSync(path, 'utf8')));
}

/** 依環境決定加密或（僅本機）明文。 */
async function pageDataOf(cwd: string, env: Env): Promise<PageData> {
  const snapshot = readSnapshot(cwd, env);
  if (env.PMO_ACCESS_PASSWORD)
    return {
      encrypted: await encryptSnapshot(snapshot, env.PMO_ACCESS_PASSWORD),
    };
  if (env.PMO_ALLOW_PLAINTEXT === '1' && !env.CI) {
    console.log('注意：PMO_ALLOW_PLAINTEXT=1，頁面資料為明文，僅限本機開發');
    return { plaintext: snapshot };
  }
  throw new Error(
    '未設定 PMO_ACCESS_PASSWORD；本機開發可設 PMO_ALLOW_PLAINTEXT=1（CI 禁止）'
  );
}

/**
 * 建置前加密：三個頁面共用同一份密文（同一組 salt），寫出 `.pmo/page-data.json`（plan ADR-003）。
 * @returns 結束碼：成功 0，失敗 1
 */
export async function main(cwd: string, env: Env): Promise<number> {
  try {
    const data = await pageDataOf(cwd, env);
    const path = join(cwd, PAGE_DATA_FILE);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, JSON.stringify(data));
    console.log(
      `已輸出 ${PAGE_DATA_FILE}（${'encrypted' in data ? '密文' : '明文'}）`
    );
    return 0;
  } catch (error) {
    console.error((error as Error).message);
    return 1;
  }
}

/* istanbul ignore next -- CLI 進入點 */
if (require.main === module) {
  main(process.cwd(), process.env).then(code => (process.exitCode = code));
}
