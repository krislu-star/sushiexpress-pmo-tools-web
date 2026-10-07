import { X } from 'lucide-react';
import { DialogClose } from '@/components/ui/dialog';

/** 對話框右上角的「關閉」按鈕（cms 的 confirm 對話框沒有內建關閉鈕）。 */
export function DialogCloseButton() {
  return (
    <DialogClose
      aria-label="關閉"
      className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-radius-4 text-icon-secondary hover:bg-button-third hover:text-icon-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-border-third"
    >
      <X aria-hidden className="h-4 w-4" />
    </DialogClose>
  );
}
