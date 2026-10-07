import { useMemo, useState } from 'react';
import {
  LIGHT_LABELS,
  LIGHTS,
  type Light,
  type MeetingCase,
} from '@/lib/pmo/meetingStore';
import { sortCases, type SortDirection } from '@/lib/pmo/sortCases';

/** 會議表格可排序的欄位。 */
export type MeetingSortKey =
  | 'lightRank'
  | 'title'
  | 'group'
  | 'owner'
  | 'status'
  | 'progress'
  | 'due'
  | 'latest'
  | 'risk'
  | 'next'
  | 'updated';

/** 小組下拉選單「全部」選項。 */
export const ALL_GROUPS = '全部小組';
/** 燈號下拉選單「全部」選項。 */
export const ALL_LIGHTS = '全部燈號';

/** 燈號顯示文字對應回燈號值。 */
export function lightOfLabel(label: string): Light | null {
  return LIGHTS.find(light => LIGHT_LABELS[light] === label) ?? null;
}

/** 會議頁的搜尋、篩選與排序（spec FR-014）；預設依燈號紅 → 黃 → 待評估 → 綠。 */
export function useMeetingList(cases: readonly MeetingCase[]) {
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState(ALL_GROUPS);
  const [light, setLight] = useState<Light | null>(null);
  const [sortKey, setSortKey] = useState<MeetingSortKey>('lightRank');
  const [direction, setDirection] = useState<SortDirection>('asc');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = cases.filter(
      c =>
        (group === ALL_GROUPS || c.group === group) &&
        (!light || c.light === light) &&
        `${c.title} ${c.owner} ${c.latest} ${c.risk} ${c.next}`
          .toLowerCase()
          .includes(q)
    );
    return sortCases(filtered, sortKey, direction);
  }, [cases, query, group, light, sortKey, direction]);

  const toggleSort = (key: MeetingSortKey) => {
    setDirection(sortKey === key && direction === 'asc' ? 'desc' : 'asc');
    setSortKey(key);
  };
  const reset = () => {
    setQuery('');
    setGroup(ALL_GROUPS);
    setLight(null);
    setSortKey('lightRank');
    setDirection('asc');
  };
  return {
    query,
    setQuery,
    group,
    setGroup,
    light,
    setLight,
    sortKey,
    direction,
    toggleSort,
    reset,
    results,
  };
}
