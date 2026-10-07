import { CASE_COLUMNS } from '@/components/shared/CaseTable';
import type { useCaseList } from '@/hooks/use-case-list';

type CaseList = ReturnType<typeof useCaseList>;

const EXTRA_LABELS: Record<string, string> = {
  order: '原表順序',
  bpmId: 'BPM 單號',
};

/** 排序欄位的顯示名稱。 */
function labelOf(key: string): string {
  return CASE_COLUMNS.find(c => c.key === key)?.label ?? EXTRA_LABELS[key];
}

/** 目前排序說明與「BPM 單號」「回到原表順序」按鈕（spec US-001）。 */
export function SortSummary({ list }: { list: CaseList }) {
  const arrow =
    list.sortKey !== 'bpmId' ? '↕' : list.direction === 'asc' ? '↑' : '↓';
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 text-text-secondary word-subtle">
      <span aria-live="polite">
        目前排序：{labelOf(list.sortKey)} ·{' '}
        {list.direction === 'asc' ? '升冪' : '降冪'}
      </span>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => list.toggleSort('bpmId')}
          className="underline-offset-2 hover:underline"
        >
          BPM 單號 <span aria-hidden>{arrow}</span>
        </button>
        <button
          type="button"
          onClick={list.resetSort}
          className="underline-offset-2 hover:underline"
        >
          回到原表順序
        </button>
      </div>
    </div>
  );
}
