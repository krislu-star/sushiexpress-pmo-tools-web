import type { ReactNode } from 'react';

interface ReportPaperProps {
  page: number;
  pageCount: number;
  title: string;
  subtitle: string;
  /** 資料說明（擷取日期與口徑） */
  note: string;
  footer: string;
  children: ReactNode;
}

/** A4 直式報告頁（spec NFR-005），呈報對象固定為副董（FR-024）。 */
export function ReportPaper({
  page,
  pageCount,
  title,
  subtitle,
  note,
  footer,
  children,
}: ReportPaperProps) {
  return (
    <section
      aria-label={`第 ${page} 頁`}
      className="report-paper relative mx-auto flex w-full max-w-[794px] flex-col bg-white px-10 pb-16 pt-8 shadow-sidebar"
    >
      <header className="flex items-baseline justify-between border-b-2 border-brand pb-3">
        <strong className="text-2xl font-extrabold tracking-[2px] text-text-brand">
          爭鮮
        </strong>
        <span className="text-text-secondary word-subtle">{subtitle}</span>
      </header>
      <div className="flex flex-wrap items-end justify-between gap-2 pt-6">
        <h2 className="text-2xl font-bold text-text-primary">{title}</h2>
        <span className="text-text-secondary word-body-medium">
          呈報對象：副董
        </span>
      </div>
      <div className="mt-3 rounded-radius-4 bg-surface-background px-3 py-2 text-text-secondary word-subtle">
        {note}
      </div>
      <div className="flex flex-col">{children}</div>
      <footer className="absolute inset-x-10 bottom-6 flex justify-between border-t border-border-primary-minor pt-2 text-text-default word-subtle">
        <span>{footer}</span>
        <span>
          {page} / {pageCount}
        </span>
      </footer>
    </section>
  );
}
