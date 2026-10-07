import { NOT_PROVIDED } from '@/lib/pmo/cases';

interface ProgressMeterProps {
  value: number | null;
  /** 案件名稱，用於進度條的無障礙名稱 */
  label: string;
  /** 表格內使用：欄名已說明，不重複顯示「完成進度」 */
  compact?: boolean;
}

/** 完成進度（spec FR-008）；原表未提供時顯示「未提供」且不畫進度條。 */
export function ProgressMeter({
  value,
  label,
  compact = false,
}: ProgressMeterProps) {
  return (
    <div className="flex min-w-[96px] flex-col gap-1">
      <div className="flex justify-between text-text-secondary word-subtle">
        {!compact && <span>完成進度</span>}
        <strong className="text-text-primary">
          {value === null ? NOT_PROVIDED : `${value}%`}
        </strong>
      </div>
      {value !== null && (
        <div
          role="progressbar"
          aria-label={`${label}完成進度`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={value}
          className="progress-track h-1.5 overflow-hidden rounded-full bg-achromatic-400"
        >
          <div
            className="progress-bar h-full bg-button-primary"
            style={{ width: `${value}%` }}
          />
        </div>
      )}
    </div>
  );
}
