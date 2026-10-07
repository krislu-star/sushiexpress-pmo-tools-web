import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useRestoreFocus } from '@/hooks/use-restore-focus';
import type { Case } from '@/lib/pmo/cases';
import type { Project } from '@/lib/pmo/projects';
import { DialogCloseButton } from '@/components/shared/DialogCloseButton';

interface RelatedCasesDialogProps {
  project: Project | null;
  onClose: () => void;
  onContact: (item: Case) => void;
}

/** 專案的關聯案件清單。 */
export function RelatedCasesDialog({
  project,
  onClose,
  onContact,
}: RelatedCasesDialogProps) {
  const restoreFocus = useRestoreFocus(project !== null);
  return (
    <Dialog open={project !== null} onOpenChange={open => !open && onClose()}>
      {project && (
        <DialogContent
          onCloseAutoFocus={restoreFocus}
          constraint={false}
          className="flex max-h-[85vh] w-[min(640px,calc(100vw-32px))] flex-col gap-4 overflow-y-auto [&>*]:shrink-0"
        >
          <DialogCloseButton />
          <DialogHeader className="max-h-none w-auto pr-8">
            <DialogTitle>{project.name}</DialogTitle>
            <DialogDescription className="line-clamp-none">
              按原表分類彙整；負責人沿用工作表。
            </DialogDescription>
          </DialogHeader>
          {project.cases.map(item => (
            <section
              key={item.id}
              className="flex flex-col gap-2 border-b border-border-primary-minor pb-3"
            >
              <h3 className="text-text-primary word-label-ui-bold">
                {item.title}
              </h3>
              <p className="whitespace-pre-line text-text-secondary word-subtle">
                {item.latest}
              </p>
              <Button
                variant="secondary"
                constraint={false}
                className="self-start"
                onClick={() => onContact(item)}
              >
                <MessageSquare aria-hidden />
                {item.owner} · Teams 訊息
              </Button>
            </section>
          ))}
        </DialogContent>
      )}
    </Dialog>
  );
}
