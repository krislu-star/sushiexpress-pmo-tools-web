import { useCallback, useRef } from 'react';

/**
 * 受控開關的 Radix Dialog 沒有 Trigger 時，關閉後不會把焦點還給原本的按鈕。
 * 在由關轉開的那次 render 記住目前焦點（早於對話框內元件的 effect 搬移焦點），
 * 回傳給 `onCloseAutoFocus` 使用的處理函式以還原焦點（WCAG 2.4.3）。
 */
export function useRestoreFocus(open: boolean) {
  const previous = useRef<HTMLElement | null>(null);
  const wasOpen = useRef(false);
  if (open && !wasOpen.current && typeof document !== 'undefined') {
    previous.current = document.activeElement as HTMLElement | null;
  }
  wasOpen.current = open;
  return useCallback((event: Event) => {
    if (!previous.current) return;
    event.preventDefault();
    previous.current.focus();
    previous.current = null;
  }, []);
}
