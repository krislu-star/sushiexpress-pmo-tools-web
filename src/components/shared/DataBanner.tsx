import type { ReactNode } from 'react';
import { formatDate } from '@/lib/pmo/format';

interface DataBannerProps {
  capturedAt: string;
  total: number;
  children?: ReactNode;
}

/** 資料來源說明（spec FR-017、US-007）：擷取日期、案件總數與示意值標示。 */
export function DataBanner({ capturedAt, total, children }: DataBannerProps) {
  return (
    <aside
      role="note"
      className="flex flex-col gap-1 rounded-radius-8 border border-border-secondary-minor bg-surface-primary px-4 py-3"
    >
      <strong className="text-text-primary word-body-medium">
        工作表擷取日期 {formatDate(capturedAt)} · 四組全部案件 {total} 件
      </strong>
      <p className="text-text-secondary word-subtle">
        資料為指定日期的工作表快照，不自動同步。完成度與燈號取自原表 Progress
        與燈號欄，空白者顯示「未提供」與「待評估」；更新日期原表未提供。進度紀錄保留原文，可能含預排事項或未註明年份的日期。
        {children}
      </p>
    </aside>
  );
}
