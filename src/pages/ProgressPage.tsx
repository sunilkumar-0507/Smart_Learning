import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ComposedChart, Legend, Line, Tooltip, XAxis, YAxis } from 'recharts';
import { BookCheck, CheckCircle2, ClipboardCheck, Clock, Flame, Library, Play, RefreshCw, Timer } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { useLookups, usePerformance, useProgressSummary } from '@/hooks/useEngine';
import { computeDailyActivity, computeWeeklyProgress } from '@/lib/engine/progress';
import { formatDateTime, toISODate } from '@/lib/date';
import { formatMinutes } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { ChartFrame, CHART_COLORS, axisProps, tooltipProps } from '@/components/domain/charts';
import type { ActivityType } from '@/types';

const ACTIVITY_ICONS: Record<ActivityType, typeof Clock> = {
  assessment: ClipboardCheck,
  'topic-started': Play,
  'topic-completed': CheckCircle2,
  'topic-reviewed': RefreshCw,
  'resource-completed': Library,
  'study-session': Timer,
};

export default function ProgressPage() {
  const activities = useAppStore((s) => s.activities);
  const results = useAppStore((s) => s.results);
  const subjects = useAppStore((s) => s.subjects);
  const topics = useAppStore((s) => s.topics);
  const progress = useAppStore((s) => s.progress);
  const resources = useAppStore((s) => s.resources);
  const completedResourceIds = useAppStore((s) => s.completedResourceIds);
  const summary = useProgressSummary();
  const { topicPerf } = usePerformance();
  const { topicById } = useLookups();
  const today = toISODate(new Date());

  const daily = useMemo(() => computeDailyActivity(activities, 14, today), [activities, today]);
  const weekly = useMemo(() => computeWeeklyProgress(activities, 8, today), [activities, today]);
  const improvements = useMemo(
    () =>
      topicPerf
        .filter((p) => p.attempts >= 2 && topicById.has(p.topicId))
        .map((p) => ({ name: topicById.get(p.topicId)!.name, change: p.improvement, first: p.first, latest: p.latest }))
        .sort((a, b) => b.change - a.change),
    [topicPerf, topicById],
  );
  const recent = useMemo(() => [...activities].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 15), [activities]);
  const subjectRows = subjects.map((s) => {
    const list = topics.filter((t) => t.subjectId === s.id);
    const done = list.filter((t) => progress[t.id]?.status === 'completed').length;
    const doing = list.filter((t) => progress[t.id]?.status === 'in-progress').length;
    return { ...s, total: list.length, done, doing };
  });

  return (
    <>
      <PageHeader title="Progress Tracking" description="Everything you have done, measured from your locally stored activity log." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Completed topics" value={`${summary.completed}/${summary.totalTopics}`} hint={`${summary.completionRate.toFixed(0)}% of curriculum`} icon={<BookCheck size={20} />} tone="success" />
        <StatCard label="Assessments" value={results.length} hint={`${topicPerf.length} distinct topics`} icon={<ClipboardCheck size={20} />} />
        <StatCard label="Learning hours" value={(summary.learningMinutes / 60).toFixed(1)} hint={formatMinutes(summary.learningMinutes)} icon={<Clock size={20} />} tone="info" />
        <StatCard label="Current streak" value={`${summary.streak}d`} hint="Consecutive active days" icon={<Flame size={20} />} tone="danger" />
        <StatCard label="Resources done" value={`${completedResourceIds.length}/${resources.length}`} hint="Marked as completed" icon={<Library size={20} />} tone="violet" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Daily activity" description="Minutes of learning activity, last 14 days">
          <ChartFrame label="Bar chart of learning minutes per day for the last fourteen days">
            <BarChart data={daily} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} />
              <XAxis dataKey="date" {...axisProps} tickFormatter={(d: string) => d.slice(8)} />
              <YAxis allowDecimals={false} {...axisProps} />
              <Tooltip {...tooltipProps} formatter={(v: number) => [`${v} min`, 'Activity']} />
              <Bar dataKey="minutes" radius={[5, 5, 0, 0]} maxBarSize={22}>
                {daily.map((d) => (
                  <Cell key={d.date} fill={d.date === today ? CHART_COLORS.accent : CHART_COLORS.primary} />
                ))}
              </Bar>
            </BarChart>
          </ChartFrame>
        </Card>

        <Card title="Weekly progress" description="Study minutes and topics completed per week">
          <ChartFrame label="Chart of weekly study minutes and topics completed over eight weeks">
            <ComposedChart data={weekly} margin={{ top: 8, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} />
              <XAxis dataKey="label" {...axisProps} />
              <YAxis yAxisId="m" allowDecimals={false} {...axisProps} />
              <YAxis yAxisId="t" orientation="right" allowDecimals={false} {...axisProps} />
              <Tooltip {...tooltipProps} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar yAxisId="m" dataKey="minutes" name="Minutes" fill={CHART_COLORS.primary} radius={[5, 5, 0, 0]} maxBarSize={26} />
              <Line yAxisId="t" dataKey="topicsCompleted" name="Topics completed" stroke={CHART_COLORS.success} strokeWidth={2.5} dot={{ r: 3 }} />
            </ComposedChart>
          </ChartFrame>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card title="Subject completion">
          <ul className="space-y-4">
            {subjectRows.map((s) => (
              <li key={s.id}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium text-slate-700">{s.name}</span>
                  <span className="text-xs text-slate-500">
                    {s.done} done · {s.doing} active · {s.total} total
                  </span>
                </div>
                <ProgressBar value={s.done} max={s.total || 1} tone={s.total > 0 && s.done === s.total ? 'success' : 'brand'} label={`${s.name} completion`} />
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Topic improvement" description="First vs latest score for retaken topics" className="lg:col-span-2">
          {improvements.length === 0 ? (
            <EmptyState icon={<RefreshCw size={22} />} title="No retaken topics yet" description="Retake an assessment after studying to measure your improvement." />
          ) : (
            <ChartFrame height={Math.max(160, improvements.length * 34)} label="Bar chart of score change per retaken topic">
              <BarChart data={improvements} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid horizontal={false} stroke={CHART_COLORS.grid} />
                <XAxis type="number" {...axisProps} />
                <YAxis type="category" dataKey="name" width={150} {...axisProps} />
                <Tooltip {...tooltipProps} formatter={(v: number, _n, item) => [`${v > 0 ? '+' : ''}${v} pts (${item.payload.first}% → ${item.payload.latest}%)`, 'Change']} />
                <Bar dataKey="change" radius={[0, 5, 5, 0]} maxBarSize={18}>
                  {improvements.map((d) => (
                    <Cell key={d.name} fill={d.change >= 0 ? CHART_COLORS.success : CHART_COLORS.danger} />
                  ))}
                </Bar>
              </BarChart>
            </ChartFrame>
          )}
        </Card>
      </div>

      <Card className="mt-6" title="Activity log" description="Most recent 15 activities" bodyClassName="p-0">
        {recent.length === 0 ? (
          <EmptyState icon={<Clock size={22} />} title="No activity yet" description="Assessments, completed topics, resources and study sessions are logged here." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {recent.map((a) => {
              const Icon = ACTIVITY_ICONS[a.type] ?? Clock;
              return (
                <li key={a.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                    <Icon size={15} />
                  </span>
                  <p className="min-w-0 flex-1 truncate text-sm text-slate-700">{a.description}</p>
                  <span className="shrink-0 text-xs text-slate-500">
                    {a.minutes > 0 && `${a.minutes} min · `}
                    {formatDateTime(a.timestamp)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </>
  );
}
