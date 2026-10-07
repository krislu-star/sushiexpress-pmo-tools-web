import { z } from 'zod';

const sheetSchema = z
  .object({
    /** 分頁名稱（讀取工作表 API 用） */
    title: z.string().trim().min(1),
    /** 分頁 gid（CSV 備援流程用；API 流程由中繼資料取得） */
    sheetId: z.number().int().nonnegative().optional(),
  })
  .strict();

/** `data/snapshot.config.json` v2（plan ADR-002）。 */
export const configSchema = z
  .object({
    spreadsheetId: z.string().trim().min(1),
    sheets: z
      .object({
        Frontend: sheetSchema,
        Project: sheetSchema,
        BPM: sheetSchema,
        SAP: sheetSchema,
      })
      .strict(),
  })
  .strict();

/** 通過驗證的快照設定。 */
export type SnapshotConfig = z.infer<typeof configSchema>;

/** 設定檔格式不符時拋出。 */
export class ConfigError extends Error {
  override name = 'ConfigError';
}

/**
 * 驗證並回傳快照設定。
 * @throws {ConfigError} 格式不符時，訊息逐行列出欄位路徑
 */
export function parseConfig(data: unknown): SnapshotConfig {
  const result = configSchema.safeParse(data);
  if (result.success) return result.data;
  const lines = result.error.issues.map(
    i => `${i.path.join('.') || '(root)'}: ${i.message}`
  );
  throw new ConfigError(`snapshot.config.json 格式不符：\n${lines.join('\n')}`);
}
