import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AppShell } from '@/components/shared/AppShell';
import { DataBanner } from '@/components/shared/DataBanner';
import { FilterSelect } from '@/components/shared/FilterSelect';
import { PageHeading } from '@/components/shared/PageHeading';
import { SearchBox } from '@/components/shared/SearchBox';
import { useMeetingEntries } from '@/hooks/use-meeting-entries';
import {
  ALL_GROUPS,
  ALL_LIGHTS,
  lightOfLabel,
  useMeetingList,
} from '@/hooks/use-meeting-list';
import type { Case } from '@/lib/pmo/cases';
import { LIGHT_LABELS, LIGHTS, type MeetingCase } from '@/lib/pmo/meetingStore';
import { GROUPS } from '@/lib/pmo/snapshotSchema';
import { MeetingEditDialog } from './MeetingEditDialog';
import { MeetingStats } from './MeetingStats';
import { MeetingTable } from './MeetingTable';

interface MeetingViewProps {
  cases: readonly Case[];
  capturedAt: string;
  /** 是否開放編輯與存檔；預設唯讀（spec 002 FR-017） */
  editable?: boolean;
}

type MeetingList = ReturnType<typeof useMeetingList>;

/** 會議篩選列。 */
function MeetingFilters({ list }: { list: MeetingList }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <SearchBox
        label="搜尋會議案件"
        placeholder="搜尋案件、負責人、風險或下一步…"
        value={list.query}
        onChange={list.setQuery}
      />
      <FilterSelect
        label="篩選會議小組"
        value={list.group}
        options={[ALL_GROUPS, ...GROUPS]}
        onChange={list.setGroup}
      />
      <FilterSelect
        label="篩選燈號"
        value={list.light ? LIGHT_LABELS[list.light] : ALL_LIGHTS}
        options={[ALL_LIGHTS, ...LIGHTS.map(l => LIGHT_LABELS[l])]}
        onChange={label => list.setLight(lightOfLabel(label))}
      />
    </div>
  );
}

/** 會議工作列表區塊。 */
function MeetingSection({
  list,
  ready,
  onEdit,
}: {
  list: MeetingList;
  ready: boolean;
  onEdit?: (item: MeetingCase) => void;
}) {
  return (
    <section
      aria-labelledby="meeting-list-title"
      className="flex flex-col gap-4"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2
          id="meeting-list-title"
          className="text-lg text-text-primary word-label-ui-bold"
        >
          會議工作列表
          <span className="ml-2 text-text-brand">{list.results.length}</span>
        </h2>
        <Button variant="link" onClick={list.reset}>
          重設篩選與排序
        </Button>
      </div>
      <MeetingFilters list={list} />
      {list.results.length ? (
        <MeetingTable list={list} ready={ready} onEdit={onEdit} />
      ) : (
        <p className="py-8 text-center text-text-default word-body">
          沒有符合條件的案件。
        </p>
      )}
      <div className="flex flex-wrap justify-between gap-2 text-text-default word-subtle">
        <span>
          {onEdit
            ? '點燈號或「更新」記錄會議結論。'
            : '目前為唯讀：燈號取自工作表。'}
        </span>
        <span>預設排序：紅燈 → 黃燈 → 待評估 → 綠燈</span>
      </div>
    </section>
  );
}

/** 會議頁資料說明：依是否開放編輯說明燈號來源與儲存方式。 */
function MeetingBanner({
  capturedAt,
  total,
  editable,
}: {
  capturedAt: string;
  total: number;
  editable: boolean;
}) {
  return (
    <DataBanner capturedAt={capturedAt} total={total}>
      {editable
        ? '燈號初始取自工作表，可由與會者修改；修改只存在本機瀏覽器，不回寫工作表，其他電腦不會同步。'
        : '目前為唯讀：燈號一律取自工作表，所有人看到的內容一致。'}
      預計完成日保留原文字，不補年份。
    </DataBanner>
  );
}

/** IT 內部會議頁（spec 001 US-006；編輯開關見 spec 002 US-005）。 */
export function MeetingView({
  cases,
  capturedAt,
  editable = false,
}: MeetingViewProps) {
  const meeting = useMeetingEntries(cases, undefined, editable);
  const list = useMeetingList(meeting.cases);
  const [editing, setEditing] = useState<MeetingCase | null>(null);
  return (
    <AppShell
      pageName="IT 內部會議"
      capturedAt={capturedAt}
      caseCount={cases.length}
    >
      <PageHeading
        eyebrow="IT TEAM MEETING"
        title="IT 內部會議"
        description="先看需要協調的案件，再確認下一步與時程。"
      />
      <MeetingBanner
        capturedAt={capturedAt}
        total={cases.length}
        editable={editable}
      />
      <MeetingStats
        cases={meeting.cases}
        active={list.light}
        onSelect={list.setLight}
      />
      <MeetingSection
        list={list}
        ready={meeting.ready}
        onEdit={editable ? setEditing : undefined}
      />
      <p role="status" className="text-text-secondary word-subtle">
        {meeting.notice}
      </p>
      {editable && (
        <MeetingEditDialog
          item={editing}
          onClose={() => setEditing(null)}
          onSave={(item, draft) => {
            meeting.save(item, draft);
            setEditing(null);
          }}
        />
      )}
    </AppShell>
  );
}
