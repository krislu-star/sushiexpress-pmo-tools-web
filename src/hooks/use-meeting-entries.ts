import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Case } from '@/lib/pmo/cases';
import {
  applyEntries,
  loadEntries,
  saveEntry,
  type MeetingDraft,
  type MeetingEntries,
} from '@/lib/pmo/meetingStore';

/** 取得 localStorage；被瀏覽器封鎖時回傳 null。 */
function browserStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** 本地時區的今天（YYYY-MM-DD）。 */
function localToday(): string {
  return new Date().toLocaleDateString('sv-SE');
}

/**
 * 會議頁的本機紀錄狀態（spec US-006、FR-015、FR-016）。
 * 靜態輸出時沒有瀏覽器儲存，因此於掛載後才讀取；讀取完成前 `ready` 為 false。
 * @param cases 原始案件
 * @param today 取得今天日期的函式（測試用）
 * @param enabled 是否啟用本機紀錄；停用（唯讀）時不讀寫 localStorage，燈號一律為原表燈號（spec 002 FR-017）
 */
export function useMeetingEntries(
  cases: readonly Case[],
  today: () => string = localToday,
  enabled = true
) {
  const [entries, setEntries] = useState<MeetingEntries>({});
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!enabled) return setReady(true);
    const loaded = loadEntries(browserStorage());
    setEntries(loaded.entries);
    setNotice(loaded.error ?? '');
    setReady(true);
  }, [enabled]);

  const save = useCallback(
    (target: Pick<Case, 'id' | 'title'>, draft: MeetingDraft) => {
      if (!enabled) return;
      const result = saveEntry(
        browserStorage(),
        entries,
        target,
        draft,
        today()
      );
      setEntries(result.entries);
      setNotice(result.message);
    },
    [enabled, entries, today]
  );

  const merged = useMemo(() => applyEntries(cases, entries), [cases, entries]);
  return { cases: merged, ready, notice, save };
}
