import { GoogleAuth } from 'google-auth-library';

const SCOPE = 'https://www.googleapis.com/auth/spreadsheets.readonly';

/**
 * 由環境變數 `GOOGLE_SERVICE_ACCOUNT_KEY`（服務帳號 JSON）建立唯讀權杖提供者。
 * 錯誤訊息不包含金鑰內容（Article IV）。
 */
export function tokenFromEnv(env: Record<string, string | undefined>) {
  return async (): Promise<string> => {
    const raw = env.GOOGLE_SERVICE_ACCOUNT_KEY;
    if (!raw) throw new Error('未設定 GOOGLE_SERVICE_ACCOUNT_KEY');
    let credentials: object;
    try {
      credentials = JSON.parse(raw);
    } catch {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY 不是有效的 JSON');
    }
    const client = await new GoogleAuth({
      credentials,
      scopes: [SCOPE],
    }).getClient();
    const { token } = await client.getAccessToken();
    if (!token) throw new Error('無法取得存取權杖');
    return token;
  };
}
