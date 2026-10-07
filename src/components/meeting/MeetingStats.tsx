import {
  LIGHT_LABELS,
  LIGHTS,
  type Light,
  type MeetingCase,
} from '@/lib/pmo/meetingStore';
import { cn } from '@/lib/utils';

const HINTS: Record<Light, string> = {
  red: '優先協調',
  yellow: '追蹤風險',
  gray: '會中確認',
  green: '持續推進',
};

interface MeetingStatsProps {
  cases: readonly MeetingCase[];
  active: Light | null;
  onSelect: (light: Light | null) => void;
}

/** 燈號統計；點選篩選該燈號，再點一次取消（spec US-006）。 */
export function MeetingStats({ cases, active, onSelect }: MeetingStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {LIGHTS.map(light => (
        <button
          key={light}
          type="button"
          aria-pressed={active === light}
          onClick={() => onSelect(active === light ? null : light)}
          className={cn(
            'flex flex-col items-start gap-1 rounded-radius-8 border bg-surface-secondary p-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-border-third',
            active === light
              ? 'border-border-brand ring-1 ring-border-brand'
              : 'border-border-primary-minor'
          )}
        >
          <span className="text-text-primary word-body-medium">
            {LIGHT_LABELS[light]}
          </span>
          <strong className="text-2xl text-text-primary">
            {cases.filter(c => c.light === light).length}
            <small className="ml-1 text-text-default word-subtle">件</small>
          </strong>
          <span className="text-text-secondary word-subtle">
            {HINTS[light]}
          </span>
        </button>
      ))}
    </div>
  );
}
