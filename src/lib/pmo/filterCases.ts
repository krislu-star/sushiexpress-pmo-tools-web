import type { Case } from './cases';
import type { Group } from './snapshotSchema';

/** 案件篩選條件；未指定的欄位代表不篩選。 */
export interface CaseFilter {
  query?: string;
  group?: Group;
  status?: string;
  project?: string;
}

/** 關鍵字比對的欄位（spec US-001）。 */
function searchText(c: Case): string {
  return [c.bpmId, c.title, c.owner, c.category, c.log].join(' ').toLowerCase();
}

/**
 * 依關鍵字、小組、狀態、專案篩選案件（spec FR-004）。
 * 關鍵字不分大小寫、忽略前後空白，比對 BPM 單號、名稱、負責人、工作類型與完整 LOG。
 */
export function filterCases(
  cases: readonly Case[],
  filter: CaseFilter
): Case[] {
  const query = filter.query?.trim().toLowerCase() ?? '';
  return cases.filter(
    c =>
      (!filter.group || c.group === filter.group) &&
      (!filter.status || c.status === filter.status) &&
      (!filter.project || c.project === filter.project) &&
      (!query || searchText(c).includes(query))
  );
}

/** 取某欄位去重後的值，保留首次出現順序，供篩選下拉選單使用。 */
export function optionsOf(
  cases: readonly Case[],
  key: 'status' | 'project' | 'group' | 'owner'
): string[] {
  return [...new Set(cases.map(c => c[key]))];
}
