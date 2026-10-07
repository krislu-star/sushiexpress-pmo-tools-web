import { parseLight, parseProgress, type Light } from './sheetFields';
import { COLUMN, GROUPS, type Group, type Snapshot } from './snapshotSchema';

/** 缺值的顯示文字。 */
export const NOT_PROVIDED = '未提供';
/** 原表分類空白時的專案名稱。 */
export const UNCATEGORIZED = '未分類';
/** 原表沒有 LOG 時的最新進度文字。 */
export const NO_LOG = '原表尚無 LOG';

/** 由快照一列推導出的案件（唯讀；見 plan 第 3.1 節）。 */
export interface Case {
  /** `${group}-row-${sourceRow}` */
  id: string;
  /** 原表順序（小組順序＋列號），作為排序同值時的依據 */
  order: number;
  group: Group;
  title: string;
  /** `${group}｜${原表分類}` */
  project: string;
  /** 工作類型（原表 Type） */
  category: string;
  /** 提出單位（原表 Raised by） */
  department: string;
  owner: string;
  status: string;
  /** 預計完成日，保留原文字 */
  due: string;
  bpmId: string;
  log: string;
  /** LOG 前三個非空行 */
  latest: string;
  /** 完成度（原表 Progress 欄，0～100）；空白為 null */
  progress: number | null;
  /** 原表燈號欄；空白為待評估 */
  sheetLight: Light;
  /** 案件更新日期；原表未提供，本版一律 null */
  updated: string | null;
  sourceRow: number;
  sourceSheetId: number;
  sourceUrl: string;
}

/** 去除前後空白，空白時回傳預設文字。 */
function orDefault(value: string, fallback: string): string {
  return value.trim() || fallback;
}

/** 取 LOG 前三個非空行（去除每行前後空白）。 */
export function latestOf(log: string): string {
  const lines = log
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);
  return lines.slice(0, 3).join('\n') || NO_LOG;
}

/** 原始工作表中該案件 D:M 範圍的連結。 */
function sourceUrlOf(spreadsheetId: string, sheetId: number, row: number) {
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#gid=${sheetId}&range=D${row}:M${row}`;
}

/** 將一列原表資料轉為案件。 */
function toCase(
  snapshot: Snapshot,
  group: Group,
  row: { sourceRow: number; values: string[] }
): Omit<Case, 'order'> {
  const v = row.values;
  const { sheetId } = snapshot.sheets[group];
  return {
    id: `${group}-row-${row.sourceRow}`,
    group,
    title: v[COLUMN.title].trim(),
    project: `${group}｜${orDefault(v[COLUMN.project], UNCATEGORIZED)}`,
    category: orDefault(v[COLUMN.type], NOT_PROVIDED),
    department: orDefault(v[COLUMN.raisedBy], NOT_PROVIDED),
    owner: orDefault(v[COLUMN.owner], NOT_PROVIDED),
    status: orDefault(v[COLUMN.status], NOT_PROVIDED),
    due: orDefault(v[COLUMN.due], NOT_PROVIDED),
    bpmId: v[COLUMN.bpmId].trim(),
    log: v[COLUMN.log],
    latest: latestOf(v[COLUMN.log]),
    progress: parseProgress(v[COLUMN.progress]),
    sheetLight: parseLight(v[COLUMN.light]),
    updated: null,
    sourceRow: row.sourceRow,
    sourceSheetId: sheetId,
    sourceUrl: sourceUrlOf(snapshot.spreadsheetId, sheetId, row.sourceRow),
  };
}

/**
 * 將快照展開為案件清單，順序為小組順序（Frontend、Project、BPM、SAP）再依原表列序。
 * @param snapshot 已通過 {@link parseSnapshot} 驗證的快照
 */
export function toCases(snapshot: Snapshot): Case[] {
  return GROUPS.flatMap(group =>
    snapshot.sheets[group].rows.map(row => toCase(snapshot, group, row))
  ).map((c, order) => ({ ...c, order }));
}
