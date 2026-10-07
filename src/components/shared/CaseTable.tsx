import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Case } from '@/lib/pmo/cases';
import { formatDate } from '@/lib/pmo/format';
import type { SortDirection, SortKey } from '@/lib/pmo/sortCases';
import { ProgressMeter } from './ProgressMeter';
import { StatusBadge } from './StatusBadge';

/** 案件列表欄位（spec US-001）。 */
export const CASE_COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'title', label: '案件名稱' },
  { key: 'project', label: '專案／分類' },
  { key: 'category', label: '工作類型' },
  { key: 'group', label: '承辦小組' },
  { key: 'owner', label: '負責人' },
  { key: 'status', label: '狀態' },
  { key: 'progress', label: '完成進度' },
  { key: 'latest', label: '進度紀錄' },
  { key: 'updated', label: '更新日期' },
];

interface CaseTableProps {
  cases: readonly Case[];
  sortKey: SortKey;
  direction: SortDirection;
  onSort: (key: SortKey) => void;
  onOpen: (item: Case) => void;
  /** 可選的前置欄位（例如逐案呈報的選取開關） */
  leading?: { header: string; cell: (item: Case) => ReactNode };
}

/** 可排序的欄名按鈕；th 上以 aria-sort 標示目前排序。 */
function SortHeader({
  column,
  sortKey,
  direction,
  onSort,
}: {
  column: (typeof CASE_COLUMNS)[number];
  sortKey: SortKey;
  direction: SortDirection;
  onSort: (key: SortKey) => void;
}) {
  const active = sortKey === column.key;
  const Icon = !active
    ? ArrowUpDown
    : direction === 'asc'
      ? ArrowUp
      : ArrowDown;
  return (
    <TableHead
      scope="col"
      aria-sort={
        active ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'
      }
    >
      <button
        type="button"
        onClick={() => onSort(column.key)}
        className="inline-flex items-center gap-1 whitespace-nowrap rounded-radius-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-border-third"
      >
        {column.label}
        <Icon aria-hidden className="h-3.5 w-3.5" />
      </button>
    </TableHead>
  );
}

/** 單列案件。 */
function CaseRow({
  item,
  onOpen,
  leading,
}: Pick<CaseTableProps, 'onOpen' | 'leading'> & { item: Case }) {
  return (
    <TableRow>
      {leading && <TableCell>{leading.cell(item)}</TableCell>}
      <TableCell className="min-w-[180px]">
        <button
          type="button"
          onClick={() => onOpen(item)}
          title={item.title}
          className="line-clamp-3 w-max max-w-[26rem] break-words text-left text-text-primary underline-offset-2 word-body-medium hover:underline"
        >
          {item.title}
        </button>
        <div className="text-text-default word-subtle">
          {item.bpmId || `來源列 ${item.sourceRow}`}
        </div>
      </TableCell>
      <TableCell>{item.project}</TableCell>
      <TableCell>{item.category}</TableCell>
      <TableCell>{item.group}</TableCell>
      <TableCell>{item.owner}</TableCell>
      <TableCell>
        <StatusBadge value={item.status} />
      </TableCell>
      <TableCell>
        <ProgressMeter value={item.progress} label={item.title} compact />
      </TableCell>
      <TableCell>
        <button
          type="button"
          onClick={() => onOpen(item)}
          aria-label={`查看${item.title}完整進度紀錄`}
          className="line-clamp-3 w-72 whitespace-pre-line break-words text-left text-text-secondary word-subtle hover:text-text-primary"
        >
          {item.latest}
        </button>
      </TableCell>
      <TableCell className="whitespace-nowrap">
        {formatDate(item.updated)}
      </TableCell>
    </TableRow>
  );
}

/** 案件列表（spec US-001），欄名可切換升降冪。 */
export function CaseTable({
  cases,
  sortKey,
  direction,
  onSort,
  onOpen,
  leading,
}: CaseTableProps) {
  return (
    <div className="overflow-x-auto rounded-radius-8 border border-border-primary-minor bg-surface-secondary">
      <Table>
        <TableHeader>
          <TableRow>
            {leading && <TableHead scope="col">{leading.header}</TableHead>}
            {CASE_COLUMNS.map(column => (
              <SortHeader
                key={column.key}
                column={column}
                sortKey={sortKey}
                direction={direction}
                onSort={onSort}
              />
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {cases.map(item => (
            <CaseRow
              key={item.id}
              item={item}
              onOpen={onOpen}
              leading={leading}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
