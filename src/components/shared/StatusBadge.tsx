import { Badge } from '@/components/ui/badge';

type Variant = 'success' | 'accent' | 'muted';

const DONE = /完成|close|done/i;
const ACTIVE = /進行|open|開發|測試/i;

/** 依原表狀態文字決定外觀；狀態文字本身不變。 */
function variantOf(status: string): Variant {
  if (DONE.test(status)) return 'success';
  if (ACTIVE.test(status)) return 'accent';
  return 'muted';
}

/** 案件狀態標籤（spec FR-008），顯示原表 Status 原文。 */
export function StatusBadge({ value }: { value: string }) {
  return (
    <Badge
      variant={variantOf(value)}
      constraint={false}
      className="h-7 px-3"
      data-status={value}
    >
      {value}
    </Badge>
  );
}
