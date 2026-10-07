import { ArrowLeft, Printer } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppShell } from '@/components/shared/AppShell';
import { PageHeading } from '@/components/shared/PageHeading';
import {
  TeamsNoticeDialog,
  type TeamsTarget,
} from '@/components/shared/TeamsNoticeDialog';
import type { Case } from '@/lib/pmo/cases';
import { formatDate } from '@/lib/pmo/format';
import { groupProjects, type Project } from '@/lib/pmo/projects';
import { CaseReportPreview } from './CaseReportPreview';
import { CaseSelection } from './CaseSelection';
import { ProjectList } from './ProjectList';
import { ProjectReport } from './ProjectReport';
import { RelatedCasesDialog } from './RelatedCasesDialog';
import { WorkList } from './WorkList';

interface ManagementViewProps {
  cases: readonly Case[];
  capturedAt: string;
}

type Mode = 'panel' | 'project-report' | 'case-report';

/** 專案呈報選取與順序：預設全部納入，順序同專案列表。 */
function useReportSelection(projects: readonly Project[]) {
  const [order, setOrder] = useState(() => projects.map(p => p.name));
  const toggle = (name: string) =>
    setOrder(current =>
      current.includes(name)
        ? current.filter(n => n !== name)
        : [...current, name]
    );
  const picked = order
    .map(name => projects.find(p => p.name === name))
    .filter((p): p is Project => !!p);
  return { order, setOrder, toggle, picked };
}

type Selection = ReturnType<typeof useReportSelection>;

/** 專案報告預覽（spec US-004）。 */
function ProjectReportMode({
  selection,
  capturedAt,
  onBack,
}: {
  selection: Selection;
  capturedAt: string;
  onBack: () => void;
}) {
  return (
    <>
      <div className="print:hidden">
        <PageHeading
          eyebrow="PROJECT PORTFOLIO"
          title="資訊專案進度報告"
          description="確認專案摘要與呈報順序，再列印或另存 PDF。"
          actions={
            <>
              <Button variant="secondary" constraint={false} onClick={onBack}>
                <ArrowLeft aria-hidden />
                返回面板
              </Button>
              <Button
                constraint={false}
                disabled={!selection.picked.length}
                onClick={() => window.print()}
              >
                <Printer aria-hidden />
                列印／另存 PDF
              </Button>
            </>
          }
        />
      </div>
      <ProjectReport
        projects={selection.picked}
        capturedAt={capturedAt}
        onOrder={selection.setOrder}
      />
    </>
  );
}

/** 專案列表底部的呈報數量與預覽按鈕。 */
function SelectionBar({
  count,
  onPreview,
}: {
  count: number;
  onPreview: () => void;
}) {
  return (
    <div className="sticky bottom-4 z-10 flex items-center justify-between gap-3 rounded-radius-8 border border-border-secondary-minor bg-surface-secondary px-4 py-3 shadow-select">
      <strong className="text-text-primary word-body-medium">
        呈報專案 {count} 個
      </strong>
      <Button constraint={false} disabled={!count} onClick={onPreview}>
        預覽報告
      </Button>
    </div>
  );
}

interface PanelProps {
  projects: readonly Project[];
  cases: readonly Case[];
  capturedAt: string;
  selection: Selection;
  pickedCases: readonly string[];
  onPickCases: (ids: string[]) => void;
  onMode: (mode: Mode) => void;
  tab: string;
  onTab: (tab: string) => void;
  onContactProject: (project: Project) => void;
  onContactCase: (item: Case) => void;
  onShowCases: (project: Project) => void;
}

/** 面板模式：標題、資料說明與三個分頁籤（spec US-003、FR-021）。 */
function PanelMode(props: PanelProps) {
  const { projects, capturedAt, selection, onMode } = props;
  return (
    <>
      <PageHeading
        eyebrow="PROJECT PORTFOLIO"
        title="主管專案面板"
        description="以專案檢視整體方向，必要時查閱關聯案件或逐案整理呈報。"
        actions={
          <Button
            constraint={false}
            disabled={!selection.picked.length}
            onClick={() => onMode('project-report')}
          >
            預覽報告
          </Button>
        }
      />
      <aside
        role="note"
        className="rounded-radius-8 border border-border-secondary-minor bg-surface-primary px-4 py-3 text-text-secondary word-subtle"
      >
        <strong className="mr-2 text-text-primary word-body-medium">
          原表分類彙整 · {projects.length} 個分類
        </strong>
        {formatDate(capturedAt)} 工作表快照，按原表 Project/Catalog
        彙整；不等同正式高階專案歸屬。彙整狀態待確認，聯繫人列出關聯案件負責人。
      </aside>
      <ManagementTabs {...props} />
    </>
  );
}

const TABS = [
  { value: 'projects', label: '專案列表' },
  { value: 'cases', label: '工作列表' },
  { value: 'case-report', label: '逐案呈報' },
] as const;

/** 專案列表／工作列表／逐案呈報分頁籤（沿用 cms 以 Button segment 呈現 Tabs 的做法）。 */
function ManagementTabs(props: PanelProps) {
  const { projects, cases, capturedAt, selection, onMode, tab } = props;
  return (
    <Tabs
      value={tab}
      onValueChange={props.onTab}
      className="flex flex-col gap-4"
    >
      <TabsList aria-label="主管列表視角" className="min-h-0">
        {TABS.map(({ value, label }) => (
          <TabsTrigger key={value} value={value} asChild>
            <Button variant="segment" active={tab === value}>
              {label}
            </Button>
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent
        value="projects"
        variant={null}
        className="flex flex-col gap-4"
      >
        <ProjectList
          projects={projects}
          selected={selection.order}
          onToggle={selection.toggle}
          onContact={props.onContactProject}
          onShowCases={props.onShowCases}
        />
        <SelectionBar
          count={selection.picked.length}
          onPreview={() => onMode('project-report')}
        />
      </TabsContent>
      <TabsContent value="cases" variant={null}>
        <WorkList cases={cases} onContact={props.onContactCase} />
      </TabsContent>
      <TabsContent value="case-report" variant={null}>
        <CaseSelection
          cases={cases}
          capturedAt={capturedAt}
          selected={props.pickedCases}
          onChange={props.onPickCases}
          onPreview={() => onMode('case-report')}
        />
      </TabsContent>
    </Tabs>
  );
}

/** 管理層呈報頁的狀態：模式、分頁籤、呈報選取與對話框。 */
function useManagementState(cases: readonly Case[]) {
  const projects = useMemo(() => groupProjects(cases), [cases]);
  const selection = useReportSelection(projects);
  const [pickedCases, setPickedCases] = useState<string[]>([]);
  const [mode, setMode] = useState<Mode>('panel');
  const [tab, setTab] = useState('projects');
  const [related, setRelated] = useState<Project | null>(null);
  const [teams, setTeams] = useState<TeamsTarget | null>(null);
  const contactCase = (item: Case) => {
    setRelated(null);
    setTeams({ owner: item.owner, subject: item.title });
  };
  const picked = pickedCases
    .map(id => cases.find(c => c.id === id))
    .filter((c): c is Case => !!c);
  return {
    projects,
    selection,
    pickedCases,
    setPickedCases,
    picked,
    mode,
    setMode,
    tab,
    setTab,
    related,
    setRelated,
    teams,
    setTeams,
    contactCase,
  };
}

type ManagementState = ReturnType<typeof useManagementState>;

/** 依模式顯示面板或報告預覽。 */
function ModeContent({
  m,
  cases,
  capturedAt,
}: {
  m: ManagementState;
  cases: readonly Case[];
  capturedAt: string;
}) {
  const back = () => m.setMode('panel');
  if (m.mode === 'project-report') {
    return (
      <ProjectReportMode
        selection={m.selection}
        capturedAt={capturedAt}
        onBack={back}
      />
    );
  }
  if (m.mode === 'case-report') {
    return (
      <CaseReportPreview
        picked={m.picked}
        capturedAt={capturedAt}
        onChange={m.setPickedCases}
        onBack={back}
      />
    );
  }
  return (
    <PanelMode
      projects={m.projects}
      cases={cases}
      capturedAt={capturedAt}
      selection={m.selection}
      pickedCases={m.pickedCases}
      onPickCases={m.setPickedCases}
      onMode={m.setMode}
      tab={m.tab}
      onTab={m.setTab}
      onContactProject={p => m.setTeams({ owner: p.owners, subject: p.name })}
      onContactCase={m.contactCase}
      onShowCases={m.setRelated}
    />
  );
}

/** 管理層呈報頁（spec US-003～US-005、FR-021）。 */
export function ManagementView({ cases, capturedAt }: ManagementViewProps) {
  const m = useManagementState(cases);
  return (
    <AppShell
      pageName="管理層呈報"
      capturedAt={capturedAt}
      caseCount={cases.length}
    >
      <ModeContent m={m} cases={cases} capturedAt={capturedAt} />
      <RelatedCasesDialog
        project={m.related}
        onClose={() => m.setRelated(null)}
        onContact={m.contactCase}
      />
      <TeamsNoticeDialog target={m.teams} onClose={() => m.setTeams(null)} />
    </AppShell>
  );
}
