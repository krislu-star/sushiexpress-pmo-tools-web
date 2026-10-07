import { MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SearchBox } from '@/components/shared/SearchBox';
import type { Case } from '@/lib/pmo/cases';

interface WorkListProps {
  cases: readonly Case[];
  onContact: (item: Case) => void;
}

/** 單一工作列。 */
function WorkRow({
  item,
  onContact,
}: {
  item: Case;
  onContact: (item: Case) => void;
}) {
  return (
    <article
      aria-labelledby={`work-${item.id}`}
      className="flex flex-col gap-3 rounded-radius-8 border border-border-primary-minor bg-surface-secondary p-4 md:flex-row md:justify-between"
    >
      <div className="flex flex-col gap-1">
        <h2
          id={`work-${item.id}`}
          className="text-base font-bold text-text-primary"
        >
          {item.title}
        </h2>
        <span className="text-text-default word-subtle">
          {item.project} · {item.group}
        </span>
        <p className="whitespace-pre-line text-text-secondary word-subtle">
          {item.latest}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-start gap-2 md:items-end">
        <span className="text-text-secondary word-subtle">
          負責人：{item.owner}
        </span>
        <Button
          variant="secondary"
          constraint={false}
          aria-label={`透過 Teams 聯繫${item.title}負責人${item.owner}`}
          onClick={() => onContact(item)}
        >
          <MessageSquare aria-hidden />
          Teams 訊息
        </Button>
      </div>
    </article>
  );
}

/** 以案件為單位的工作列表（spec US-003）。 */
export function WorkList({ cases, onContact }: WorkListProps) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const shown = cases.filter(c =>
    `${c.title} ${c.project} ${c.owner}`.toLowerCase().includes(q)
  );
  return (
    <div className="flex flex-col gap-3">
      <SearchBox
        label="搜尋管理層工作列表"
        placeholder="搜尋案件、專案或負責人…"
        value={query}
        onChange={setQuery}
      />
      {shown.map(item => (
        <WorkRow key={item.id} item={item} onContact={onContact} />
      ))}
      {!shown.length && (
        <p className="py-8 text-center text-text-default word-body">
          沒有符合條件的案件。
        </p>
      )}
    </div>
  );
}
