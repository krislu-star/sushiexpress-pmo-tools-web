import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { moveBy, reorder } from '@/lib/pmo/reorder';

/** 拖曳中的狀態。 */
export interface DragState {
  name: string;
  x: number;
  y: number;
  /** 放下後的位置（以扣除拖曳項目後的清單計） */
  slot: number;
  moved: boolean;
}

const KEY_DELTA: Record<string, number | undefined> = {
  ArrowUp: -1,
  ArrowDown: 1,
};

/** 依指標位置計算放下位置：第一個中線在指標下方的項目之前。 */
function slotAt(root: HTMLElement | null, name: string, y: number): number {
  const others = Array.from(
    root?.querySelectorAll<HTMLElement>('[data-drag-item]') ?? []
  ).filter(el => el.dataset.dragItem !== name);
  const index = others.findIndex(el => {
    const rect = el.getBoundingClientRect();
    return y < rect.top + rect.height / 2;
  });
  return index < 0 ? others.length : index;
}

/** 鍵盤排序：上／下移一格，Home／End 移到頭尾。 */
function keyTarget(
  items: readonly string[],
  name: string,
  key: string
): string[] | null {
  const delta = KEY_DELTA[key];
  if (delta !== undefined) return moveBy(items, name, delta);
  if (key === 'Home') return reorder(items, name, 0);
  if (key === 'End') return reorder(items, name, items.length - 1);
  return null;
}

/**
 * 呈報排序（spec FR-012）：支援指標拖曳與鍵盤（上／下／Home／End），Esc 取消拖曳，
 * 並提供螢幕閱讀器朗讀的狀態文字。
 * @param items 目前順序（名稱）
 * @param onOrder 新順序；未提供時停用排序
 */
export function useDragOrder(
  items: readonly string[],
  onOrder?: (next: string[]) => void
) {
  const root = useRef<HTMLElement | null>(null);
  const drag = useRef<DragState | null>(null);
  const latest = useRef({ items, onOrder });
  const pendingFocus = useRef<string | null>(null);
  const [state, setState] = useState<DragState | null>(null);
  const [announcement, setAnnouncement] = useState('');

  latest.current = { items, onOrder };
  const announce = useCallback(
    (name: string, next: readonly string[]) =>
      setAnnouncement(
        `${name}已移至第 ${next.indexOf(name) + 1} 位，共 ${next.length} 個專案。`
      ),
    []
  );

  useLayoutEffect(() => {
    const name = pendingFocus.current;
    if (!name) return;
    pendingFocus.current = null;
    root.current
      ?.querySelector<HTMLElement>(`[data-drag-handle="${CSS.escape(name)}"]`)
      ?.focus();
  }, [items]);

  useDragListeners(root, drag, latest, setState, setAnnouncement, announce);

  const start = useCallback((event: React.PointerEvent, name: string) => {
    if (!latest.current.onOrder || !event.isPrimary || event.button !== 0)
      return;
    event.preventDefault();
    drag.current = {
      name,
      x: event.clientX,
      y: event.clientY,
      slot: latest.current.items.indexOf(name),
      moved: false,
    };
    setState({ ...drag.current });
  }, []);

  const keyDown = (event: React.KeyboardEvent, name: string) => {
    const next = keyTarget(items, name, event.key);
    if (!next || !onOrder) return;
    event.preventDefault();
    pendingFocus.current = name;
    onOrder(next);
    announce(name, next);
  };

  return { root, drag: state, announcement, start, keyDown };
}

type Latest = React.MutableRefObject<{
  items: readonly string[];
  onOrder?: (next: string[]) => void;
}>;

interface ListenerDeps {
  root: React.MutableRefObject<HTMLElement | null>;
  drag: React.MutableRefObject<DragState | null>;
  latest: Latest;
  setState: (s: DragState | null) => void;
  setAnnouncement: (text: string) => void;
  announce: (name: string, next: readonly string[]) => void;
}

/** 建立拖曳期間的事件處理函式。 */
function createHandlers({
  root,
  drag,
  latest,
  setState,
  setAnnouncement,
  announce,
}: ListenerDeps) {
  const move = (event: PointerEvent) => {
    const current = drag.current;
    if (!current) return;
    current.moved ||=
      Math.abs(event.clientY - current.y) +
        Math.abs(event.clientX - current.x) >
      4;
    Object.assign(current, {
      x: event.clientX,
      y: event.clientY,
      slot: slotAt(root.current, current.name, event.clientY),
    });
    setState({ ...current });
  };
  const finish = (cancel: boolean) => {
    const current = drag.current;
    if (!current) return;
    drag.current = null;
    setState(null);
    if (cancel) return setAnnouncement('已取消移動。');
    if (!current.moved) return;
    const next = reorder(latest.current.items, current.name, current.slot);
    latest.current.onOrder?.(next);
    announce(current.name, next);
  };
  const cancel = () => finish(true);
  const key = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || !drag.current) return;
    event.preventDefault();
    cancel();
  };
  return { move, up: () => finish(false), cancel, key };
}

/** 拖曳期間掛在 window 上的指標與鍵盤事件。 */
function useDragListeners(
  root: ListenerDeps['root'],
  drag: ListenerDeps['drag'],
  latest: Latest,
  setState: ListenerDeps['setState'],
  setAnnouncement: ListenerDeps['setAnnouncement'],
  announce: ListenerDeps['announce']
) {
  useEffect(() => {
    const h = createHandlers({
      root,
      drag,
      latest,
      setState,
      setAnnouncement,
      announce,
    });
    const listeners: [string, EventListener][] = [
      ['pointermove', h.move as EventListener],
      ['pointerup', h.up],
      ['pointercancel', h.cancel],
      ['keydown', h.key as EventListener],
      ['blur', h.cancel],
    ];
    listeners.forEach(([type, fn]) => window.addEventListener(type, fn));
    return () =>
      listeners.forEach(([type, fn]) => window.removeEventListener(type, fn));
  }, [root, drag, latest, setState, setAnnouncement, announce]);
}
