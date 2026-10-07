import { useMemo, useState } from 'react';
import type { Case } from '@/lib/pmo/cases';
import { filterCases } from '@/lib/pmo/filterCases';
import type { Group } from '@/lib/pmo/snapshotSchema';
import {
  sortCases,
  type SortDirection,
  type SortKey,
} from '@/lib/pmo/sortCases';

/** 下拉選單「全部」選項的文字（同時作為值）。 */
export const ALL = {
  project: '全部專案',
  group: '全部小組',
  status: '全部狀態',
} as const;

/** 案件列表的搜尋、篩選與排序狀態（spec FR-004、FR-005）。 */
export function useCaseList(cases: readonly Case[]) {
  const [query, setQuery] = useState('');
  const [project, setProject] = useState<string>(ALL.project);
  const [group, setGroup] = useState<string>(ALL.group);
  const [status, setStatus] = useState<string>(ALL.status);
  const [sortKey, setSortKey] = useState<SortKey>('order');
  const [direction, setDirection] = useState<SortDirection>('asc');

  const results = useMemo(() => {
    const filtered = filterCases(cases, {
      query,
      project: project === ALL.project ? undefined : project,
      group: group === ALL.group ? undefined : (group as Group),
      status: status === ALL.status ? undefined : status,
    });
    return sortCases(filtered, sortKey, direction);
  }, [cases, query, project, group, status, sortKey, direction]);

  /** 點同一欄切換升降冪；換欄時從升冪開始。 */
  const toggleSort = (key: SortKey) => {
    setDirection(sortKey === key && direction === 'asc' ? 'desc' : 'asc');
    setSortKey(key);
  };
  const resetSort = () => {
    setSortKey('order');
    setDirection('asc');
  };
  const resetFilters = () => {
    setQuery('');
    setProject(ALL.project);
    setGroup(ALL.group);
    setStatus(ALL.status);
  };

  return {
    filters: { query, project, group, status },
    setQuery,
    setProject,
    setGroup,
    setStatus,
    sortKey,
    direction,
    toggleSort,
    resetSort,
    resetFilters,
    results,
  };
}
