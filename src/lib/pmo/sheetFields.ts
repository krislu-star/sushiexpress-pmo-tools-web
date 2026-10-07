/** 燈號，依會議處理優先序排列：紅 → 黃 → 待評估 → 綠（spec US-006）。 */
export const LIGHTS = ['red', 'yellow', 'gray', 'green'] as const;

/** 燈號值。 */
export type Light = (typeof LIGHTS)[number];

/** 燈號顯示文字（與原表燈號欄的寫法相同）。 */
export const LIGHT_LABELS: Record<Light, string> = {
  red: '🔴 紅燈',
  yellow: '🟡 黃燈',
  gray: '⚪ 待評估',
  green: '🟢 綠燈',
};

/** 原表欄位值無法辨識時拋出；訊息包含原始值。 */
export class SheetFieldError extends Error {
  override name = 'SheetFieldError';
}

const PERCENT = /^(\d{1,3})%?$/;

/**
 * 解析原表 Progress 欄（spec FR-008、SC-010）。
 * @returns 0～100 的整數；空白時為 null
 * @throws {SheetFieldError} 無法辨識或超出 0～100 時
 */
export function parseProgress(raw: string): number | null {
  const text = raw.trim();
  if (!text) return null;
  const match = PERCENT.exec(text);
  const value = match ? Number(match[1]) : NaN;
  if (!(value >= 0 && value <= 100)) {
    throw new SheetFieldError(`Progress「${raw}」無法辨識，應為 0%～100%`);
  }
  return value;
}

const LIGHT_KEYWORDS: [Light, RegExp][] = [
  ['red', /🔴|紅/],
  ['yellow', /🟡|黃/],
  ['green', /🟢|綠/],
  ['gray', /⚪|待評估/],
];

/**
 * 解析原表燈號欄（spec US-006、SC-010）；接受「🔴 紅燈」或「紅燈」等寫法。
 * @returns 燈號；空白時為待評估（gray）
 * @throws {SheetFieldError} 無法辨識時
 */
export function parseLight(raw: string): Light {
  const text = raw.trim();
  if (!text) return 'gray';
  const found = LIGHT_KEYWORDS.find(([, pattern]) => pattern.test(text));
  if (!found)
    throw new SheetFieldError(
      `燈號「${raw}」無法辨識，應為紅燈、黃燈、綠燈或待評估`
    );
  return found[0];
}
