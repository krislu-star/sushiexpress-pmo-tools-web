import { ArrowDown, ArrowLeft, ArrowUp, Printer, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeading } from '@/components/shared/PageHeading';
import { ProgressMeter } from '@/components/shared/ProgressMeter';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type { Case } from '@/lib/pmo/cases';
import { formatDate } from '@/lib/pmo/format';
import { paginate } from '@/lib/pmo/paginate';
import { moveBy } from '@/lib/pmo/reorder';
import { ReportPaper } from './ReportPaper';

interface CaseReportPreviewProps {
  picked: readonly Case[];
  capturedAt: string;
  onChange: (ids: string[]) => void;
  onBack: () => void;
}

/** 報告中的單一案件。 */
function CaseEntry({ item, index }: { item: Case; index: number }) {
  return (
    <article className="report-case flex flex-col gap-2 border-b border-border-primary-minor py-4">
      <div className="flex items-start gap-3">
        <b className="text-lg text-text-brand">
          {String(index + 1).padStart(2, '0')}
        </b>
        <div className="flex flex-1 flex-col">
          <h3 className="text-base font-bold text-text-primary">
            {item.title}
          </h3>
          <span className="text-text-default word-subtle">
            {item.group} · 來源列 {item.sourceRow} · {item.owner}
          </span>
        </div>
        <StatusBadge value={item.status} />
      </div>
      <ProgressMeter value={item.progress} label={item.title} />
      <p className="whitespace-pre-line text-text-secondary word-subtle">
        <strong className="mr-2 text-text-primary">
          最新進度（原表 LOG 前 3 行，可能含預排事項）
        </strong>
        {item.latest}
      </p>
      <div className="text-text-default word-subtle">
        更新日期：{formatDate(item.updated)}　｜　預計完成：{item.due}
      </div>
    </article>
  );
}

/** 呈報順序清單：上移、下移、移除。 */
function OrderList({
  picked,
  onChange,
}: Pick<CaseReportPreviewProps, 'picked' | 'onChange'>) {
  const ids = picked.map(c => c.id);
  return (
    <aside className="flex flex-col gap-3 rounded-radius-8 border border-border-primary-minor bg-surface-secondary p-4 lg:w-80 print:hidden">
      <h2 className="text-text-primary word-label-ui-bold">
        呈報順序 {picked.length} 件
      </h2>
      <ol aria-label="呈報順序" className="flex flex-col gap-2">
        {picked.map((item, index) => (
          <li
            key={item.id}
            className="flex items-center gap-2 text-text-primary word-subtle"
          >
            <span className="text-text-default">
              {String(index + 1).padStart(2, '0')}
            </span>
            <strong className="flex-1">{item.title}</strong>
            <Button
              variant="icon-just"
              aria-label={`上移${item.title}`}
              disabled={index === 0}
              onClick={() => onChange(moveBy(ids, item.id, -1))}
            >
              <ArrowUp aria-hidden />
            </Button>
            <Button
              variant="icon-just"
              aria-label={`下移${item.title}`}
              disabled={index === picked.length - 1}
              onClick={() => onChange(moveBy(ids, item.id, 1))}
            >
              <ArrowDown aria-hidden />
            </Button>
            <Button
              variant="icon-just"
              aria-label={`移除${item.title}`}
              onClick={() => onChange(ids.filter(id => id !== item.id))}
            >
              <X aria-hidden />
            </Button>
          </li>
        ))}
      </ol>
      <p className="text-text-default word-subtle">A4 直式 · 每頁最多 3 件</p>
    </aside>
  );
}

/** 預覽標題與返回／列印按鈕。 */
function PreviewHeading({
  count,
  onBack,
}: {
  count: number;
  onBack: () => void;
}) {
  return (
    <div className="print:hidden">
      <PageHeading
        eyebrow="IT CASE REPORT"
        title="資訊案件進度報告"
        description="確認選取案件及順序後，即可列印或另存 PDF。"
        actions={
          <>
            <Button variant="secondary" constraint={false} onClick={onBack}>
              <ArrowLeft aria-hidden />
              返回選案
            </Button>
            <Button
              constraint={false}
              disabled={!count}
              onClick={() => window.print()}
            >
              <Printer aria-hidden />
              列印／另存 PDF
            </Button>
          </>
        }
      />
    </div>
  );
}

/** A4 報告頁：每頁最多 3 件。 */
function CasePages({
  picked,
  capturedAt,
}: Pick<CaseReportPreviewProps, 'picked' | 'capturedAt'>) {
  const pages = paginate(picked, 3);
  const note = `${formatDate(capturedAt)} 工作表快照 · 選取案件 ${picked.length} 件 · 缺漏欄位不推定`;
  return (
    <div className="report-pages flex flex-1 flex-col gap-6">
      {pages.map((page, pageIndex) => (
        <ReportPaper
          key={pageIndex}
          page={pageIndex + 1}
          pageCount={pages.length}
          title="資訊案件進度報告"
          subtitle="資訊服務 · 管理層呈報"
          note={note}
          footer="爭鮮 · IT 案件追蹤"
        >
          {page.map((item, i) => (
            <CaseEntry key={item.id} item={item} index={pageIndex * 3 + i} />
          ))}
          {!picked.length && (
            <p className="py-10 text-center text-text-default word-body">
              尚未選取呈報案件。
            </p>
          )}
        </ReportPaper>
      ))}
    </div>
  );
}

/** 資訊案件進度報告預覽（spec FR-021）。 */
export function CaseReportPreview({
  picked,
  capturedAt,
  onChange,
  onBack,
}: CaseReportPreviewProps) {
  return (
    <>
      <PreviewHeading count={picked.length} onBack={onBack} />
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <OrderList picked={picked} onChange={onChange} />
        <CasePages picked={picked} capturedAt={capturedAt} />
      </div>
    </>
  );
}
