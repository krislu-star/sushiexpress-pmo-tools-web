import { z } from 'zod';
import type { Case } from './cases';
import { LIGHTS, type Light } from './sheetFields';

/** 本機儲存 key；以版號區隔，不讀 PoC 舊資料（plan ADR-005）。 */
export const MEETING_STORAGE_KEY = 'sushi-pmo-meeting-v1';

export { LIGHT_LABELS, LIGHTS, type Light } from './sheetFields';

const entrySchema = z.object({
  light: z.enum(LIGHTS),
  risk: z.string(),
  next: z.string(),
  due: z.string(),
  updated: z.string(),
  /** 儲存時的案件名稱；載入時不符即忽略，避免列號位移後錯置 */
  titleFingerprint: z.string(),
});

/** 單一案件的會議紀錄。 */
export type MeetingEntry = z.infer<typeof entrySchema>;

/** 以案件 id 為 key 的會議紀錄集合。 */
export type MeetingEntries = Record<string, MeetingEntry>;

/** 會議編輯表單可修改的欄位。 */
export type MeetingDraft = Pick<
  MeetingEntry,
  'light' | 'risk' | 'next' | 'due'
>;

/** 套用會議紀錄後的案件。 */
export type MeetingCase = Case & {
  light: Light;
  /** 燈號排序值，供 sortCases 使用 */
  lightRank: number;
  /** 燈號來源：本機會議紀錄或原表燈號欄 */
  lightSource: 'local' | 'sheet';
  risk: string;
  next: string;
};

type ReadableStorage = Pick<Storage, 'getItem'>;
type WritableStorage = Pick<Storage, 'setItem'>;

/** 逐筆驗證，只保留格式正確的紀錄（spec FR-015）。 */
function validEntries(raw: Record<string, unknown>): MeetingEntries {
  return Object.fromEntries(
    Object.entries(raw).flatMap(([id, value]) => {
      const parsed = entrySchema.strip().safeParse(value);
      return parsed.success ? [[id, parsed.data]] : [];
    })
  );
}

/**
 * 從本機儲存讀取會議紀錄。讀取失敗或資料損毀時回傳空集合與錯誤訊息，不中斷頁面。
 * @param storage 瀏覽器儲存；無法取得時傳入 null
 */
export function loadEntries(storage: ReadableStorage | null): {
  entries: MeetingEntries;
  error?: string;
} {
  let text: string | null;
  try {
    if (!storage) throw new Error('storage unavailable');
    text = storage.getItem(MEETING_STORAGE_KEY);
  } catch {
    return { entries: {}, error: '無法讀取本機儲存，暫以原始資料顯示。' };
  }
  if (text === null) return { entries: {} };
  try {
    const raw: unknown = JSON.parse(text);
    if (!raw || typeof raw !== 'object' || Array.isArray(raw))
      throw new Error();
    return { entries: validEntries(raw as Record<string, unknown>) };
  } catch {
    return {
      entries: {},
      error: '本機儲存的會議紀錄已損毀，暫以原始資料顯示。',
    };
  }
}

/**
 * 將會議紀錄套用到案件；沒有紀錄或名稱指紋不符時用原表燈號（空白為待評估），預計完成日沿用原表。
 */
export function applyEntries(
  cases: readonly Case[],
  entries: MeetingEntries
): MeetingCase[] {
  return cases.map(c => {
    const entry = entries[c.id];
    const valid = entry && entry.titleFingerprint === c.title;
    const light: Light = valid ? entry.light : c.sheetLight;
    return {
      ...c,
      light,
      lightRank: LIGHTS.indexOf(light),
      lightSource: valid ? 'local' : 'sheet',
      risk: valid ? entry.risk : '',
      next: valid ? entry.next : '',
      due: valid ? entry.due : c.due,
      updated: valid ? entry.updated : null,
    };
  });
}

/**
 * 儲存一筆會議紀錄。本機儲存不可用時仍回傳更新後的紀錄（僅保留至離開頁面）。
 * @param today 更新日期 YYYY-MM-DD
 */
export function saveEntry(
  storage: WritableStorage | null,
  entries: MeetingEntries,
  target: Pick<Case, 'id' | 'title'>,
  draft: MeetingDraft,
  today: string
): { entries: MeetingEntries; saved: boolean; message: string } {
  const next: MeetingEntries = {
    ...entries,
    [target.id]: { ...draft, updated: today, titleFingerprint: target.title },
  };
  try {
    if (!storage) throw new Error('storage unavailable');
    storage.setItem(MEETING_STORAGE_KEY, JSON.stringify(next));
    return {
      entries: next,
      saved: true,
      message: '已儲存於本機，未回寫工作表。',
    };
  } catch {
    return {
      entries: next,
      saved: false,
      message: '本機儲存不可用；修改僅保留至離開此頁，未回寫工作表。',
    };
  }
}
