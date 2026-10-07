import { useRestoreFocus } from '@/hooks/use-restore-focus';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DialogCloseButton } from './DialogCloseButton';

/** 聯繫對象：負責人與主旨（案件或專案名稱）。 */
export interface TeamsTarget {
  owner: string;
  subject: string;
}

interface TeamsNoticeDialogProps {
  target: TeamsTarget | null;
  onClose: () => void;
}

/**
 * Teams 聯繫說明（spec FR-013、SC-006）。本版未設定 Teams 帳號對照，
 * 只說明狀況，不開啟或傳送任何訊息。
 */
export function TeamsNoticeDialog({ target, onClose }: TeamsNoticeDialogProps) {
  const restoreFocus = useRestoreFocus(target !== null);
  return (
    <Dialog open={target !== null} onOpenChange={open => !open && onClose()}>
      {target && (
        <DialogContent
          onCloseAutoFocus={restoreFocus}
          constraint={false}
          className="w-[min(440px,calc(100vw-32px))]"
        >
          <DialogCloseButton />
          <DialogHeader className="max-h-none w-auto pr-8">
            <MessageSquare aria-hidden className="h-6 w-6 text-icon-brand" />
            <DialogTitle>與負責人聯繫</DialogTitle>
            <DialogDescription className="line-clamp-none">
              {target.subject} · 負責人：{target.owner || '待指定'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 text-text-secondary word-body">
            <p>
              負責人沿用工作表，但尚未設定 Teams 帳號，因此無法直接開啟對話。
            </p>
            <p className="text-text-default word-subtle">
              目前未開啟或傳送任何訊息。
            </p>
          </div>
          <DialogFooter className="h-auto">
            <Button variant="secondary" onClick={onClose}>
              了解，返回
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}
