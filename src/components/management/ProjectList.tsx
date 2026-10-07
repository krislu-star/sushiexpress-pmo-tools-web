import { MessageSquare } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { FilterSelect } from '@/components/shared/FilterSelect';
import { SearchBox } from '@/components/shared/SearchBox';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PROJECT_PHASES, type Project } from '@/lib/pmo/projects';

const ALL_PHASES = '全部狀態';

interface ProjectListProps {
  projects: readonly Project[];
  selected: readonly string[];
  onToggle: (name: string) => void;
  onContact: (project: Project) => void;
  onShowCases: (project: Project) => void;
}

type RowActions = Omit<ProjectListProps, 'projects' | 'selected'>;

/** 專案列右側：負責人、Teams 聯繫與關聯案件。 */
function ProjectActions({
  project,
  onContact,
  onShowCases,
}: Omit<RowActions, 'onToggle'> & { project: Project }) {
  return (
    <div className="col-start-2 flex flex-col items-start gap-2 lg:col-start-auto lg:items-stretch">
      <span className="text-text-default word-subtle">
        關聯案件負責人：{project.owners || '待指定'}
      </span>
      <Button
        variant="secondary"
        constraint={false}
        aria-label={`透過 Teams 聯繫${project.name}專案負責人`}
        onClick={() => onContact(project)}
      >
        <MessageSquare aria-hidden />
        Teams 聯繫
      </Button>
      <Button
        variant="subtle"
        constraint={false}
        onClick={() => onShowCases(project)}
      >
        關聯案件 {project.cases.length}
      </Button>
    </div>
  );
}

/** 單一專案列。 */
function ProjectRow({
  project,
  checked,
  onToggle,
  ...actions
}: RowActions & { project: Project; checked: boolean }) {
  const titleId = `project-${project.name}`;
  return (
    <article
      aria-labelledby={titleId}
      className="grid grid-cols-[40px_1fr] gap-x-4 gap-y-3 rounded-radius-8 border border-border-primary-minor bg-surface-secondary p-4 lg:grid-cols-[40px_minmax(200px,1fr)_2fr_220px]"
    >
      <Switch
        checked={checked}
        aria-label={`將${project.name}納入呈報`}
        onCheckedChange={() => onToggle(project.name)}
        className="mt-1"
      />
      <div className="flex flex-col items-start gap-2">
        <h2 id={titleId} className="text-base font-bold text-text-primary">
          {project.name}
        </h2>
        <StatusBadge value={project.phase} />
      </div>
      <div className="col-start-2 lg:col-start-auto">
        <span className="text-text-default word-subtle">進度紀錄彙整</span>
        <p className="line-clamp-6 whitespace-pre-line text-text-secondary word-subtle">
          {project.summary}
        </p>
      </div>
      <ProjectActions project={project} {...actions} />
    </article>
  );
}

/** 專案搜尋與彙整狀態篩選。 */
function useProjectFilter(projects: readonly Project[]) {
  const [query, setQuery] = useState('');
  const [phase, setPhase] = useState(ALL_PHASES);
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter(
      p =>
        (phase === ALL_PHASES || p.phase === phase) &&
        `${p.name} ${p.summary}`.toLowerCase().includes(q)
    );
  }, [projects, query, phase]);
  const reset = () => {
    setQuery('');
    setPhase(ALL_PHASES);
  };
  return { query, setQuery, phase, setPhase, shown, reset };
}

/** 依「小組｜原表分類」彙整的專案列表（spec US-003、FR-010）。 */
export function ProjectList({
  projects,
  selected,
  ...actions
}: ProjectListProps) {
  const filter = useProjectFilter(projects);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <SearchBox
          label="搜尋專案"
          placeholder="搜尋專案名稱或進度紀錄…"
          value={filter.query}
          onChange={filter.setQuery}
        />
        <FilterSelect
          label="篩選專案狀態"
          value={filter.phase}
          options={[ALL_PHASES, ...PROJECT_PHASES]}
          onChange={filter.setPhase}
        />
        <Button variant="link" onClick={filter.reset}>
          重設
        </Button>
      </div>
      {filter.shown.map(project => (
        <ProjectRow
          key={project.name}
          project={project}
          checked={selected.includes(project.name)}
          {...actions}
        />
      ))}
      {!filter.shown.length && (
        <p className="py-8 text-center text-text-default word-body">
          沒有符合條件的專案。
        </p>
      )}
    </div>
  );
}
