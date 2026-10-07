import { NOT_PROVIDED, type Case } from './cases';

/** 專案彙整狀態選項（spec FR-010）；本版所有專案皆為「待確認」。 */
export const PROJECT_PHASES = [
  '未決議',
  '執行中',
  '完成／成效',
  '待確認',
] as const;

/** 專案彙整狀態。 */
export type ProjectPhase = (typeof PROJECT_PHASES)[number];

/** 依「小組｜原表分類」彙整的專案（plan 第 3.1 節）。 */
export interface Project {
  name: string;
  phase: ProjectPhase;
  cases: Case[];
  /** 「案件名稱：最新進度」逐行串接 */
  summary: string;
  /** 去重後的關聯案件負責人，以「、」連接；皆未提供時為空字串 */
  owners: string;
}

/** 由同一專案的案件組成專案。 */
function toProject(name: string, cases: Case[]): Project {
  const owners = new Set(
    cases.map(c => c.owner).filter(o => o !== NOT_PROVIDED)
  );
  return {
    name,
    phase: '待確認',
    cases,
    summary: cases.map(c => `${c.title}：${c.latest}`).join('\n'),
    owners: [...owners].join('、'),
  };
}

/**
 * 依案件的 project 欄位彙整專案（spec FR-009），保留首次出現順序。
 */
export function groupProjects(cases: readonly Case[]): Project[] {
  const groups = new Map<string, Case[]>();
  for (const c of cases)
    groups.set(c.project, [...(groups.get(c.project) ?? []), c]);
  return [...groups].map(([name, list]) => toProject(name, list));
}
