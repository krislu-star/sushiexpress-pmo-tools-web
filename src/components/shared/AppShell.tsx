import { HelpCircle } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { AboutDialog } from './AboutDialog';
import { PageNav } from './PageNav';

interface AppShellProps {
  pageName: string;
  capturedAt: string;
  caseCount: number;
  children: ReactNode;
}

/** 頁面外殼：品牌頂欄（含三頁導覽，spec 002 FR-018）、主內容與頁尾（spec FR-001、FR-002）；無側欄。 */
export function AppShell({
  pageName,
  capturedAt,
  caseCount,
  children,
}: AppShellProps) {
  const [aboutOpen, setAboutOpen] = useState(false);
  return (
    <div className="flex min-h-screen flex-col">
      <header className="app-topbar flex flex-wrap items-center gap-x-6 gap-y-2 border-t-[5px] border-brand bg-[#202124] px-4 py-4 text-text-invert md:px-10 print:hidden">
        <div className="flex items-baseline gap-3">
          <strong className="text-[28px] font-extrabold leading-tight tracking-[2px] text-brand md:text-[32px]">
            爭鮮
          </strong>
          <span className="text-[11px] font-semibold tracking-[1.6px]">
            SUSHI EXPRESS
          </span>
        </div>
        <PageNav current={pageName} />
        <button
          type="button"
          aria-label="關於這個版本"
          onClick={() => setAboutOpen(true)}
          className="ml-auto flex min-h-10 items-center gap-2 rounded-radius-4 px-2 text-xs text-achromatic-400 hover:text-text-invert focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
        >
          <HelpCircle aria-hidden className="h-[18px] w-[18px]" />
          <span>v0.1 · 資料快照</span>
        </button>
      </header>
      <main className="mx-auto flex w-full max-w-[1800px] flex-1 flex-col gap-6 px-4 py-6 md:px-10 print:p-0">
        {children}
      </main>
      <footer className="app-footer flex justify-between px-4 pb-6 text-text-default word-subtle md:px-10 print:hidden">
        <span>爭鮮 · IT 案件追蹤與管理層呈報</span>
        <span>資料快照 {capturedAt.replaceAll('-', '/')}</span>
      </footer>
      <AboutDialog
        open={aboutOpen}
        onOpenChange={setAboutOpen}
        capturedAt={capturedAt}
        caseCount={caseCount}
      />
    </div>
  );
}
