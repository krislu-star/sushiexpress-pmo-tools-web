import { ArrowDown, ArrowUp, ArrowUpDown, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ProgressMeter } from '@/components/shared/ProgressMeter';
import type { MeetingSortKey, useMeetingList } from '@/hooks/use-meeting-list';
import { formatDate } from '@/lib/pmo/format';
import { LIGHT_LABELS, type MeetingCase } from '@/lib/pmo/meetingStore';
import { cn } from '@/lib/utils';

const COLUMNS: [MeetingSortKey, string][] = [
  ['lightRank', '燈號'],
  ['title', '案件名稱'],
  ['group', '小組'],
  ['owner', '負責人'],
  ['status', '狀態'],
  ['progress', '完成度'],
  ['due', '預計完成日'],
  ['latest', '進度紀錄'],
  ['risk', '風險／需要協助'],
  ['next', '下一步'],
  ['updated', '更新日期'],
];

const LIGHT_STYLE = {
  red: 'border-error-300 bg-error-100',
  yellow: 'border-warning-200 bg-warning-100',
  green: 'border-success-200 bg-success-100',
  gray: 'border-border-primary bg-surface-secondary',
};

interface MeetingTableProps {
  list: ReturnType<typeof useMeetingList>;
  ready: boolean;
  /** 未提供時為唯讀：燈號不可點、無「更新」按鈕與操作欄（spec 002 FR-017） */
  onEdit?: (item: MeetingCase) => void;
}

type EditProps = { ready: boolean; onEdit?: (item: MeetingCase) => void };

/** 燈號：可編輯時為按鈕（點選開啟編輯），唯讀時為標籤；本機修改過的燈號另外標示。 */
function LightButton({
  item,
  ready,
  onEdit,
}: EditProps & { item: MeetingCase }) {
  const style = cn(
    'whitespace-nowrap rounded-radius-64 border px-3 py-1 text-text-primary word-subtle-semibold disabled:opacity-50',
    LIGHT_STYLE[item.light]
  );
  if (!onEdit)
    return (
      <span className={cn(style, 'inline-block')}>
        {LIGHT_LABELS[item.light]}
      </span>
    );
  return (
    <>
      <button
        type="button"
        disabled={!ready}
        onClick={() => onEdit(item)}
        aria-label={`修改${item.title}燈號`}
        className={style}
      >
        {LIGHT_LABELS[item.light]}
      </button>
      {item.lightSource === 'local' && (
        <span className="mt-1 block text-text-default word-subtle">
          本機修改
        </span>
      )}
    </>
  );
}

/** 文字欄位：固定寬度並保留換行。 */
function TextCell({
  text,
  width = 'w-48',
  muted = false,
}: {
  text: string;
  width?: string;
  muted?: boolean;
}) {
  return (
    <TableCell>
      <span
        className={cn(
          'block whitespace-pre-line',
          width,
          muted && 'line-clamp-3 text-text-secondary word-subtle'
        )}
      >
        {text}
      </span>
    </TableCell>
  );
}

/** 單列會議案件。 */
function MeetingRow({
  item,
  ready,
  onEdit,
}: EditProps & { item: MeetingCase }) {
  return (
    <TableRow data-light={item.light}>
      <TableCell>
        <LightButton item={item} ready={ready} onEdit={onEdit} />
      </TableCell>
      <TableCell>
        <strong
          title={item.title}
          className="line-clamp-3 w-max max-w-[26rem] break-words word-body-medium"
        >
          {item.title}
        </strong>
      </TableCell>
      <TableCell>{item.group}</TableCell>
      <TableCell>{item.owner}</TableCell>
      <TableCell>{item.status}</TableCell>
      <TableCell>
        <ProgressMeter value={item.progress} label={item.title} compact />
      </TableCell>
      <TableCell>{item.due}</TableCell>
      <TextCell text={item.latest} width="w-64" muted />
      <TextCell text={item.risk || '—'} />
      <TextCell text={item.next || '待填寫'} />
      <TableCell className="whitespace-nowrap">
        {formatDate(item.updated)}
      </TableCell>
      {onEdit && (
        <TableCell>
          <Button
            variant="secondary"
            constraint={false}
            disabled={!ready}
            onClick={() => onEdit(item)}
          >
            <Pencil aria-hidden />
            更新
          </Button>
        </TableCell>
      )}
    </TableRow>
  );
}

/** 可排序的欄名。 */
function SortHead({
  list,
  column,
}: {
  list: MeetingTableProps['list'];
  column: [MeetingSortKey, string];
}) {
  const [key, label] = column;
  const active = list.sortKey === key;
  const Icon = !active
    ? ArrowUpDown
    : list.direction === 'asc'
      ? ArrowUp
      : ArrowDown;
  return (
    <TableHead
      scope="col"
      aria-sort={
        active
          ? list.direction === 'asc'
            ? 'ascending'
            : 'descending'
          : 'none'
      }
    >
      <button
        type="button"
        onClick={() => list.toggleSort(key)}
        className="inline-flex items-center gap-1 whitespace-nowrap"
      >
        {label}
        <Icon aria-hidden className="h-3.5 w-3.5" />
      </button>
    </TableHead>
  );
}

/** 會議工作列表（spec FR-014）。 */
export function MeetingTable({ list, ready, onEdit }: MeetingTableProps) {
  return (
    <div className="overflow-x-auto rounded-radius-8 border border-border-primary-minor bg-surface-secondary">
      <Table>
        <TableHeader>
          <TableRow>
            {COLUMNS.map(column => (
              <SortHead key={column[0]} list={list} column={column} />
            ))}
            {onEdit && <TableHead scope="col">操作</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {list.results.map(item => (
            <MeetingRow
              key={item.id}
              item={item}
              ready={ready}
              onEdit={onEdit}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
