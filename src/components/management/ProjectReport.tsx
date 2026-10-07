import { GripVertical } from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useDragOrder, type DragState } from '@/hooks/use-drag-order';
import { formatDate } from '@/lib/pmo/format';
import { paginate } from '@/lib/pmo/paginate';
import type { Project } from '@/lib/pmo/projects';
import { cn } from '@/lib/utils';
import { ReportPaper } from './ReportPaper';

interface ProjectReportProps {
  projects: readonly Project[];
  capturedAt: string;
  /** 提供時可拖曳或以鍵盤調整順序；列印版不提供 */
  onOrder?: (names: string[]) => void;
}

type Drag = ReturnType<typeof useDragOrder>;

/** 報告中的單一專案。 */
function ProjectEntry({ project, drag }: { project: Project; drag?: Drag }) {
  const state = drag?.drag;
  return (
    <article
      data-drag-item={project.name}
      className={cn(
        'report-case relative flex flex-col gap-2 border-b border-border-primary-minor py-5',
        drag && 'pl-9',
        state?.moved && state.name === project.name && 'opacity-40'
      )}
    >
      {drag && (
        <button
          type="button"
          data-drag-handle={project.name}
          aria-label={`移動${project.name}`}
          aria-describedby="project-drag-help"
          onPointerDown={event => drag.start(event, project.name)}
          onKeyDown={event => drag.keyDown(event, project.name)}
          className="drag-handle absolute left-0 top-5 flex h-8 w-8 cursor-grab touch-none items-center justify-center rounded-radius-4 text-icon-secondary hover:bg-button-third focus-visible:outline focus-visible:outline-2 focus-visible:outline-border-third active:cursor-grabbing"
        >
          <GripVertical aria-hidden className="h-5 w-5" />
        </button>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-bold text-text-primary">{project.name}</h3>
        <StatusBadge value={project.phase} />
      </div>
      <p className="text-text-secondary word-body">
        <strong className="mr-2 text-text-primary">整體進展</strong>
        彙整進度參考下方紀錄；整體完成度尚未提供
      </p>
      <p className="whitespace-pre-line text-text-secondary word-body">
        <strong className="mr-2 text-text-primary">進度紀錄彙整</strong>
        {project.summary}
      </p>
    </article>
  );
}

/** 拖曳時跟隨指標的名稱標籤。 */
function DragLabel({ state }: { state: DragState | null }) {
  if (!state?.moved) return null;
  return (
    <div
      aria-hidden
      className="drag-handle pointer-events-none fixed z-50 flex items-center gap-2 rounded-radius-6 bg-surface-secondary px-3 py-2 shadow-select word-body-medium"
      style={{ top: state.y + 18, left: state.x + 12 }}
    >
      <GripVertical className="h-4 w-4" />
      {state.name}
    </div>
  );
}

/** 拖曳操作說明與朗讀區。 */
function DragHelp({ announcement }: { announcement: string }) {
  return (
    <>
      <p
        id="project-drag-help"
        className="drag-handle text-center text-text-secondary word-subtle"
      >
        拖曳專案旁的把手調整順序；鍵盤可用上下方向鍵、Home、End 移動，Esc
        取消拖曳。
      </p>
      <span role="status" className="sr-only">
        {announcement}
      </span>
    </>
  );
}

/** 資訊專案進度報告：A4 每頁最多 2 個專案（spec FR-011、FR-012）。 */
export function ProjectReport({
  projects,
  capturedAt,
  onOrder,
}: ProjectReportProps) {
  const drag = useDragOrder(
    projects.map(p => p.name),
    onOrder
  );
  const pages = paginate(projects, 2);
  const note = `${formatDate(capturedAt)} 工作表快照 · 原表分類彙整 · 整體狀態待確認`;
  return (
    <div
      ref={el => {
        drag.root.current = el;
      }}
      className="report-pages flex flex-col gap-6"
    >
      {onOrder && <DragHelp announcement={drag.announcement} />}
      {pages.map((page, index) => (
        <ReportPaper
          key={index}
          page={index + 1}
          pageCount={pages.length}
          title="資訊專案進度報告"
          subtitle="資訊專案進度報告"
          note={note}
          footer="資訊專案管理 · 呈報用"
        >
          {page.map(project => (
            <ProjectEntry
              key={project.name}
              project={project}
              drag={onOrder ? drag : undefined}
            />
          ))}
          {!projects.length && (
            <p className="py-10 text-center text-text-default word-body">
              尚未選取呈報專案。
            </p>
          )}
        </ReportPaper>
      ))}
      <DragLabel state={drag.drag} />
    </div>
  );
}
