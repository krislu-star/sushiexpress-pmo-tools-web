import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** 查無結果時的空狀態（spec SC-003）。 */
export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-radius-8 border border-dashed border-border-primary bg-surface-secondary px-4 py-10 text-center">
      <Search aria-hidden className="h-8 w-8 text-icon-secondary" />
      <h3 className="text-text-primary word-label-ui-bold">{title}</h3>
      {description && (
        <p className="text-text-secondary word-subtle">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
