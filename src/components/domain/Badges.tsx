import type { PerformanceThresholds, PriorityLevel, TopicStatus } from '@/types';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { classifyPerformance, type PerformanceBand } from '@/lib/engine/performance';

const priorityTones: Record<PriorityLevel, BadgeTone> = { Critical: 'danger', High: 'warning', Medium: 'info', Low: 'neutral' };

export function PriorityBadge({ level, score }: { level: PriorityLevel; score?: number }) {
  return (
    <Badge tone={priorityTones[level]}>
      {level}
      {score !== undefined && <span className="opacity-70">· {score.toFixed(1)}</span>}
    </Badge>
  );
}

export const bandTones: Record<PerformanceBand, BadgeTone> = {
  'Needs Improvement': 'danger',
  Developing: 'warning',
  Good: 'info',
  Excellent: 'success',
};

export const bandColors: Record<PerformanceBand, string> = {
  'Needs Improvement': '#dc2626',
  Developing: '#d97706',
  Good: '#0284c7',
  Excellent: '#059669',
};

export function PerformanceBadge({ score, thresholds }: { score: number | null; thresholds: PerformanceThresholds }) {
  if (score === null) return <Badge tone="neutral">Not assessed</Badge>;
  const band = classifyPerformance(score, thresholds);
  return (
    <Badge tone={bandTones[band]}>
      {band} · {Math.round(score)}%
    </Badge>
  );
}

const statusMeta: Record<TopicStatus, { label: string; tone: BadgeTone }> = {
  'not-started': { label: 'Not started', tone: 'neutral' },
  'in-progress': { label: 'In progress', tone: 'violet' },
  completed: { label: 'Completed', tone: 'success' },
};

export function StatusBadge({ status }: { status: TopicStatus }) {
  const meta = statusMeta[status];
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}

export function DifficultyDots({ level }: { level: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`Difficulty ${level} of 5`} title={`Difficulty ${level}/5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`h-1.5 w-3 rounded-full ${i <= level ? 'bg-brand-600' : 'bg-slate-200'}`} />
      ))}
    </span>
  );
}
