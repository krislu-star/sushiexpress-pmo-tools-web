import { Button } from '@/components/ui/button';
import { FilterSelect } from '@/components/shared/FilterSelect';
import { SearchBox } from '@/components/shared/SearchBox';
import { ALL, type useCaseList } from '@/hooks/use-case-list';
import type { Case } from '@/lib/pmo/cases';
import { optionsOf } from '@/lib/pmo/filterCases';
import { GROUPS } from '@/lib/pmo/snapshotSchema';

type CaseList = ReturnType<typeof useCaseList>;

/** 案件搜尋與篩選列（spec FR-004）。 */
export function CaseFilters({
  cases,
  list,
}: {
  cases: readonly Case[];
  list: CaseList;
}) {
  const { filters } = list;
  return (
    <div className="flex flex-wrap items-center gap-3">
      <SearchBox
        label="搜尋案件"
        placeholder="搜尋案件、單號、負責人或最新進度…"
        value={filters.query}
        onChange={list.setQuery}
      />
      <FilterSelect
        label="篩選所屬專案"
        value={filters.project}
        options={[ALL.project, ...optionsOf(cases, 'project')]}
        onChange={list.setProject}
      />
      <FilterSelect
        label="篩選小組"
        value={filters.group}
        options={[ALL.group, ...GROUPS]}
        onChange={list.setGroup}
      />
      <FilterSelect
        label="篩選狀態"
        value={filters.status}
        options={[ALL.status, ...optionsOf(cases, 'status')]}
        onChange={list.setStatus}
      />
      <Button variant="link" onClick={list.resetFilters}>
        重設
      </Button>
    </div>
  );
}
