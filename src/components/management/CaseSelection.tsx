import { ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { CaseDetailDialog } from '@/components/shared/CaseDetailDialog';
import { CaseTable } from '@/components/shared/CaseTable';
import { CaseFilters } from '@/components/tracker/CaseFilters';
import { SortSummary } from '@/components/tracker/SortSummary';
import { useCaseList } from '@/hooks/use-case-list';
import type { Case } from '@/lib/pmo/cases';

interface CaseSelectionProps {
  cases: readonly Case[];
  capturedAt: string;
  selected: readonly string[];
  onChange: (ids: string[]) => void;
  onPreview: () => void;
}

/** 已選數量、清空與檢視呈報內容。 */
function CaseSelectionBar({
  count,
  onClear,
  onPreview,
}: {
  count: number;
  onClear: () => void;
  onPreview: () => void;
}) {
  return (
    <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-radius-8 border border-border-secondary-minor bg-surface-secondary px-4 py-3 shadow-select">
      <div className="flex items-baseline gap-2">
        <strong className="text-text-primary word-body-medium">
          已選 {count} 件
        </strong>
        <small className="text-text-default word-subtle">
          切換篩選仍保留選案
        </small>
      </div>
      <div className="flex gap-2">
        <Button variant="link" disabled={!count} onClick={onClear}>
          清空選案
        </Button>
        <Button constraint={false} disabled={!count} onClick={onPreview}>
          檢視呈報內容
          <ChevronRight aria-hidden />
        </Button>
      </div>
    </div>
  );
}

/** 逐案選取的狀態：篩選結果、只看已選、切換與全選目前結果。 */
function useCaseSelection(
  cases: readonly Case[],
  selected: readonly string[],
  onChange: (ids: string[]) => void
) {
  const list = useCaseList(cases);
  const [onlySelected, setOnlySelected] = useState(false);
  const shown = onlySelected
    ? list.results.filter(c => selected.includes(c.id))
    : list.results;
  const toggle = (id: string) =>
    onChange(
      selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]
    );
  const pickShown = () =>
    onChange([...new Set([...selected, ...shown.map(c => c.id)])]);
  return { list, onlySelected, setOnlySelected, shown, toggle, pickShown };
}

/** 「只看已選」與「選取目前結果」。 */
function SelectionTools({
  state,
}: {
  state: ReturnType<typeof useCaseSelection>;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4 text-text-secondary word-subtle">
      <label className="flex items-center gap-2">
        <Switch
          checked={state.onlySelected}
          onCheckedChange={state.setOnlySelected}
          aria-label="只看已選案件"
        />
        只看已選案件
      </label>
      <Button
        variant="subtle"
        constraint={false}
        disabled={!state.shown.length}
        onClick={state.pickShown}
      >
        選取目前結果（{state.shown.length}）
      </Button>
    </div>
  );
}

/** 逐案選取呈報案件（spec FR-021）。 */
export function CaseSelection({
  cases,
  capturedAt,
  selected,
  onChange,
  onPreview,
}: CaseSelectionProps) {
  const state = useCaseSelection(cases, selected, onChange);
  const [detail, setDetail] = useState<Case | null>(null);
  const leading = {
    header: '呈報',
    cell: (item: Case) => (
      <Switch
        checked={selected.includes(item.id)}
        onCheckedChange={() => state.toggle(item.id)}
        aria-label={`將${item.title}納入呈報`}
      />
    ),
  };
  return (
    <div className="flex flex-col gap-4">
      <CaseFilters cases={cases} list={state.list} />
      <SelectionTools state={state} />
      <SortSummary list={state.list} />
      <CaseTable
        cases={state.shown}
        sortKey={state.list.sortKey}
        direction={state.list.direction}
        onSort={state.list.toggleSort}
        onOpen={setDetail}
        leading={leading}
      />
      <CaseSelectionBar
        count={selected.length}
        onClear={() => onChange([])}
        onPreview={onPreview}
      />
      <CaseDetailDialog
        item={detail}
        capturedAt={capturedAt}
        onClose={() => setDetail(null)}
      />
    </div>
  );
}
