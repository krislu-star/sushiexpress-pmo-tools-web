/**
 * 會議頁是否開放編輯與存檔（spec 002 FR-017；plan ADR-008）。
 * 只有 `NEXT_PUBLIC_PMO_MEETING_EDIT=true` 開啟，未設定或其他值皆為唯讀（預設）。
 * 靜態匯出時於建置階段決定。
 */
export function meetingEditableOf(
  env: Record<string, string | undefined>
): boolean {
  return env.NEXT_PUBLIC_PMO_MEETING_EDIT === 'true';
}
