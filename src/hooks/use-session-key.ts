import type { SessionKey } from '@/lib/pmo/crypto';

/** sessionStorage 中保存衍生金鑰的 key；關閉分頁即清除（spec US-004）。 */
export const SESSION_KEY_NAME = 'sushi-pmo-key';

/** 讀取本分頁保存的金鑰；不存在、格式錯誤或無法存取時回傳 null。 */
export function loadSessionKey(): SessionKey | null {
  try {
    const value = JSON.parse(
      sessionStorage.getItem(SESSION_KEY_NAME) ?? 'null'
    );
    return typeof value?.salt === 'string' && typeof value?.key === 'string'
      ? value
      : null;
  } catch {
    return null;
  }
}

/** 保存金鑰（不含密碼）；無法存取 sessionStorage 時略過（每頁需重新輸入）。 */
export function saveSessionKey(key: SessionKey): void {
  try {
    sessionStorage.setItem(SESSION_KEY_NAME, JSON.stringify(key));
  } catch {
    // 無法保存時僅影響跨頁免重輸，不影響本頁使用
  }
}
