import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FilterSelect } from '@/components/shared/FilterSelect';
import { lightOfLabel } from '@/hooks/use-meeting-list';
import { useRestoreFocus } from '@/hooks/use-restore-focus';
import {
  LIGHT_LABELS,
  LIGHTS,
  type MeetingCase,
  type MeetingDraft,
} from '@/lib/pmo/meetingStore';
import { DialogCloseButton } from '@/components/shared/DialogCloseButton';

interface MeetingEditDialogProps {
  item: MeetingCase | null;
  onClose: () => void;
  onSave: (item: MeetingCase, draft: MeetingDraft) => void;
}

/** 表單欄位。 */
function DraftFields({
  draft,
  onChange,
}: {
  draft: MeetingDraft;
  onChange: (draft: MeetingDraft) => void;
}) {
  const field = 'word-body-medium flex flex-col gap-1 text-text-primary';
  return (
    <>
      <FilterSelect
        label="人工燈號"
        value={LIGHT_LABELS[draft.light]}
        options={LIGHTS.map(l => LIGHT_LABELS[l])}
        onChange={label =>
          onChange({ ...draft, light: lightOfLabel(label) ?? draft.light })
        }
      />
      <label className={field}>
        風險／需要協助
        <Textarea
          rows={3}
          value={draft.risk}
          placeholder="記錄風險、阻塞原因或需協調事項"
          onChange={e => onChange({ ...draft, risk: e.target.value })}
        />
      </label>
      <label className={field}>
        下一步
        <Textarea
          rows={3}
          value={draft.next}
          onChange={e => onChange({ ...draft, next: e.target.value })}
        />
      </label>
      <label className={field}>
        預計完成日
        <Input
          value={draft.due}
          placeholder="保留原日期文字，或填寫 YYYY-MM-DD"
          onChange={e => onChange({ ...draft, due: e.target.value })}
        />
      </label>
    </>
  );
}

/** 編輯表單：欄位與取消／儲存。 */
function DraftForm({
  item,
  draft,
  onDraft,
  onClose,
  onSave,
}: MeetingEditDialogProps & {
  item: MeetingCase;
  draft: MeetingDraft;
  onDraft: (d: MeetingDraft) => void;
}) {
  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={event => {
        event.preventDefault();
        onSave(item, draft);
      }}
    >
      <DraftFields draft={draft} onChange={onDraft} />
      <DialogFooter className="h-auto">
        <Button variant="secondary" onClick={onClose}>
          取消
        </Button>
        <Button type="submit">
          <Save aria-hidden />
          儲存
        </Button>
      </DialogFooter>
    </form>
  );
}

/** 更新會議追蹤（spec US-006）；只修改本機資料。 */
export function MeetingEditDialog(props: MeetingEditDialogProps) {
  const { item, onClose } = props;
  const [draft, setDraft] = useState<MeetingDraft | null>(null);
  const restoreFocus = useRestoreFocus(item !== null);
  useEffect(
    () =>
      setDraft(
        item && {
          light: item.light,
          risk: item.risk,
          next: item.next,
          due: item.due,
        }
      ),
    [item]
  );
  return (
    <Dialog open={item !== null} onOpenChange={open => !open && onClose()}>
      {item && draft && (
        <DialogContent
          onCloseAutoFocus={restoreFocus}
          constraint={false}
          className="w-[min(520px,calc(100vw-32px))]"
        >
          <DialogCloseButton />
          <DialogHeader className="max-h-none w-auto pr-8">
            <DialogTitle>更新會議追蹤</DialogTitle>
            <DialogDescription className="line-clamp-none">
              {item.title} · 僅修改本機資料，不回寫工作表
            </DialogDescription>
          </DialogHeader>
          <DraftForm {...props} item={item} draft={draft} onDraft={setDraft} />
        </DialogContent>
      )}
    </Dialog>
  );
}
