import { ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useRestoreFocus } from '@/hooks/use-restore-focus';
import type { Case } from '@/lib/pmo/cases';
import { formatDate } from '@/lib/pmo/format';
import { ProgressMeter } from './ProgressMeter';
import { StatusBadge } from './StatusBadge';
import { DialogCloseButton } from './DialogCloseButton';

interface CaseDetailDialogProps {
  /** 要顯示的案件；null 時關閉 */
  item: Case | null;
  capturedAt: string;
  onClose: () => void;
}

/** 案件欄位清單。 */
function DetailFields({ item }: { item: Case }) {
  const fields: [string, string][] = [
    ['專案／分類（依原表）', item.project],
    ['工作類型', item.category],
    ['負責人', item.owner],
    ['預計完成', item.due],
    ['更新日期', formatDate(item.updated)],
  ];
  return (
    <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {fields.map(([term, value]) => (
        <div key={term}>
          <dt className="text-text-default word-subtle">{term}</dt>
          <dd className="text-text-primary word-body">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** 完整 LOG 與原始工作表連結（spec FR-007）。LOG 一律以純文字呈現。 */
function FullLog({ item }: { item: Case }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-text-primary word-label-ui-bold">原表完整 LOG</h3>
      <p className="whitespace-pre-wrap rounded-radius-6 bg-surface-background p-3 text-text-secondary word-body">
        {item.log.trim() || '原表尚無 LOG'}
      </p>
      <a
        href={item.sourceUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 self-start text-text-brand underline underline-offset-2 word-body-medium"
      >
        查看原始工作表
        <ExternalLink aria-hidden className="h-4 w-4" />
      </a>
    </section>
  );
}

/** 案件詳細內容對話框（spec US-002）。 */
export function CaseDetailDialog({
  item,
  capturedAt,
  onClose,
}: CaseDetailDialogProps) {
  const restoreFocus = useRestoreFocus(item !== null);
  return (
    <Dialog open={item !== null} onOpenChange={open => !open && onClose()}>
      {item && (
        <DialogContent
          onCloseAutoFocus={restoreFocus}
          constraint={false}
          className="flex max-h-[85vh] w-[min(640px,calc(100vw-32px))] flex-col gap-4 overflow-y-auto [&>*]:shrink-0"
        >
          <DialogCloseButton />
          <DialogHeader className="max-h-none w-auto pr-8">
            <DialogTitle>{item.title}</DialogTitle>
            <DialogDescription className="line-clamp-none">
              {item.group} 原表 · 來源列 {item.sourceRow} ·{' '}
              {formatDate(capturedAt)} 擷取
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap items-center gap-4">
            <StatusBadge value={item.status} />
            <ProgressMeter value={item.progress} label={item.title} />
          </div>
          <DetailFields item={item} />
          <FullLog item={item} />
        </DialogContent>
      )}
    </Dialog>
  );
}
