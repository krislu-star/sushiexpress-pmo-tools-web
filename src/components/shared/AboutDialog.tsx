import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatDate } from '@/lib/pmo/format';
import { DialogCloseButton } from './DialogCloseButton';

interface AboutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  capturedAt: string;
  caseCount: number;
}

/** 「關於這個版本」：資料範圍、示意值與尚未串接的功能（spec US-007）。 */
export function AboutDialog({
  open,
  onOpenChange,
  capturedAt,
  caseCount,
}: AboutDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        constraint={false}
        className="w-[min(560px,calc(100vw-32px))]"
      >
        <DialogCloseButton />
        <DialogHeader className="max-h-none w-auto pr-8">
          <DialogTitle>關於這個版本</DialogTitle>
          <DialogDescription className="line-clamp-none">
            資料範圍、示意值與尚未串接的功能。
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 text-text-secondary word-body">
          <p>
            本版讀取 {formatDate(capturedAt)} 的 IT 週報工作表快照，涵蓋
            Frontend、Project、BPM、SAP 四組全部案件，共 {caseCount}{' '}
            件。小組、負責人、狀態與 LOG 沿用原表。
          </p>
          <p>
            完成度與燈號取自原表 Progress
            與燈號欄，空白者顯示「未提供」與「待評估」；原表沒有案件更新日期。主管頁以原表
            Project/Catalog
            彙整專案，不代表正式的高階專案歸屬；專案彙整狀態暫定為待確認。
          </p>
          <p>
            資料不會自動同步。會議燈號、風險與下一步只存在本機瀏覽器，不回寫工作表；尚未串接
            BPM 登入、Google Sheets 回寫與 Teams 帳號。
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
