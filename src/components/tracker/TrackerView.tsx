import { useState } from 'react';
import { AppShell } from '@/components/shared/AppShell';
import { CaseDetailDialog } from '@/components/shared/CaseDetailDialog';
import { CaseTable } from '@/components/shared/CaseTable';
import { DataBanner } from '@/components/shared/DataBanner';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeading } from '@/components/shared/PageHeading';
import { useCaseList } from '@/hooks/use-case-list';
import type { Case } from '@/lib/pmo/cases';
import { CaseFilters } from './CaseFilters';
import { SortSummary } from './SortSummary';

interface TrackerViewProps {
  cases: readonly Case[];
  capturedAt: string;
}

/** 案件列表或空狀態。 */
function Results({
  list,
  onOpen,
}: {
  list: ReturnType<typeof useCaseList>;
  onOpen: (c: Case) => void;
}) {
  if (!list.results.length) {
    return (
      <EmptyState
        title="找不到符合條件的案件"
        description="試試其他關鍵字，或清除篩選條件。"
        actionLabel="清除篩選"
        onAction={list.resetFilters}
      />
    );
  }
  return (
    <CaseTable
      cases={list.results}
      sortKey={list.sortKey}
      direction={list.direction}
      onSort={list.toggleSort}
      onOpen={onOpen}
    />
  );
}

/** IT 案件追蹤頁（spec US-001、US-002、US-007）。 */
export function TrackerView({ cases, capturedAt }: TrackerViewProps) {
  const list = useCaseList(cases);
  const [detail, setDetail] = useState<Case | null>(null);
  return (
    <AppShell
      pageName="IT 案件追蹤"
      capturedAt={capturedAt}
      caseCount={cases.length}
    >
      <PageHeading
        eyebrow="CASE TRACKER"
        title="IT 案件追蹤"
        description="查詢 IT 案件，掌握最新處理進度。"
      />
      <DataBanner capturedAt={capturedAt} total={cases.length} />
      <section
        className="flex flex-col gap-4"
        aria-labelledby="case-list-title"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2
            id="case-list-title"
            className="text-lg text-text-primary word-label-ui-bold"
          >
            案件列表
            <span className="ml-2 text-text-brand">{list.results.length}</span>
          </h2>
          <span className="text-text-default word-subtle">
            點欄名可切換升冪／降冪
          </span>
        </div>
        <CaseFilters cases={cases} list={list} />
        <SortSummary list={list} />
        <Results list={list} onOpen={setDetail} />
        <div className="flex flex-wrap justify-between gap-2 text-text-default word-subtle">
          <span>共 {list.results.length} 件符合條件</span>
          <span>欄位依原表呈現 · 不自動同步</span>
        </div>
      </section>
      <CaseDetailDialog
        item={detail}
        capturedAt={capturedAt}
        onClose={() => setDetail(null)}
      />
    </AppShell>
  );
}
