import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowRight, BookOpen, CheckCircle2, ClipboardCheck, Clock, Flame, Layers, ListTodo, Sparkles, Target } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { useLookups, usePerformance, useProgressSummary, useRanking } from '@/hooks/useEngine';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { Button, ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { PerformanceBadge, PriorityBadge } from '@/components/domain/Badges';
import { ChartFrame, CHART_COLORS, axisProps, tooltipProps } from '@/components/domain/charts';
import { computeDailyActivity } from '@/lib/engine/progress';
import { formatDateTime, toISODate } from '@/lib/date';
import { formatMinutes } from '@/lib/format';
import { toast } from '@/store/toastStore';

export default function DashboardPage() {
  const profile = useAppStore((s) => s.profile)!;
  const subjects = useAppStore((s) => s.subjects);
  const topics = useAppStore((s) => s.topics);
  const progress = useAppStore((s) => s.progress);
  const results = useAppStore((s) => s.results);
  const activities = useAppStore((s) => s.activities);
  const thresholds = useAppStore((s) => s.settings.thresholds);
  const startTopic = useAppStore((s) => s.startTopic);
  const summary = useProgressSummary();
  const { overall } = usePerformance();
  const { recommendations } = useRanking();
  const { topicById, subjectById } = useLookups();

  const weekly = useMemo(() => computeDailyActivity(activities, 7, toISODate(new Date())), [activities]);
  const weeklyMinutes = weekly.reduce((s, d) => s + d.minutes, 0);
  const subjectProgress = useMemo(
    () =>
      subjects.map((s) => {
        const list = topics.filter((t) => t.subjectId === s.id);
        const done = list.filter((t) => progress[t.id]?.status === 'completed').length;
        return { id: s.id, name: s.name, color: s.color, done, total: list.length, pct: list.length ? (done / list.length) * 100 : 0 };
      }),
    [subjects, topics, progress],
  );
  const recent = useMemo(() => [...results].sort((a, b) => b.completedAt.localeCompare(a.completedAt)).slice(0, 5), [results]);

  const next = recommendations[0];
  const nextTopic = next ? topicById.get(next.topicId) : undefined;
  const firstName = profile.name.split(' ')[0];

  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Your learning overview. Every figure below is calculated from your own assessments and activity."
        actions={
          <ButtonLink to="/assessment" icon={<ClipboardCheck size={16} />}>
            Take an assessment
          </ButtonLink>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Enrolled subjects" value={subjects.length} hint={`${summary.totalTopics} learning topics in total`} icon={<BookOpen size={20} />} />
        <StatCard label="Completed topics" value={summary.completed} hint={`${summary.completionRate.toFixed(0)}% of all topics`} icon={<CheckCircle2 size={20} />} tone="success" />
        <StatCard label="Pending topics" value={summary.pending} hint={`${summary.inProgress} currently in progress`} icon={<ListTodo size={20} />} tone="warning" />
        <StatCard
          label="Overall score"
          value={overall === null ? '—' : `${overall.toFixed(1)}%`}
          hint={overall === null ? 'No assessments yet' : 'Mean of latest topic scores'}
          icon={<Target size={20} />}
          tone="violet"
        />
        <StatCard label="Learning streak" value={`${summary.streak} ${summary.streak === 1 ? 'day' : 'days'}`} hint="Consecutive days with activity" icon={<Flame size={20} />} tone="danger" />
        <StatCard label="Learning time" value={formatMinutes(summary.learningMinutes)} hint={`${formatMinutes(weeklyMinutes)} in the last 7 days`} icon={<Clock size={20} />} tone="info" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card
          className="lg:col-span-2"
          title={
            <span className="flex items-center gap-2">
              <Sparkles size={16} className="text-accent-500" /> Recommended next topic
            </span>
          }
          actions={
            <Link to="/recommendations" className="text-xs font-semibold text-brand-700 hover:underline">
              View all recommendations
            </Link>
          }
        >
          {next && nextTopic ? (
            <div>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{nextTopic.name}</p>
                  <p className="text-sm text-slate-500">
                    {subjectById.get(nextTopic.subjectId)?.name} · {formatMinutes(nextTopic.estimatedMinutes)} · {next.kind === 'review' ? 'Revision' : 'New learning'}
                  </p>
                </div>
                <PriorityBadge level={next.level} score={next.priority} />
              </div>
              <ul className="mt-4 space-y-1.5 text-sm text-slate-600">
                {next.reasons.slice(0, 4).map((r) => (
                  <li key={r} className="flex gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                    {r}
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex flex-wrap gap-2">
                <ButtonLink to={`/assessment/${nextTopic.id}`} icon={<ClipboardCheck size={16} />}>
                  {next.assessed ? 'Retake assessment' : 'Take assessment'}
                </ButtonLink>
                {progress[nextTopic.id]?.status !== 'in-progress' && next.kind === 'learn' && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      startTopic(nextTopic.id);
                      toast(`Started ${nextTopic.name}.`);
                    }}
                  >
                    Start topic
                  </Button>
                )}
                <ButtonLink to={`/resources?topic=${nextTopic.id}`} variant="ghost">
                  Study resources <ArrowRight size={14} />
                </ButtonLink>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={<CheckCircle2 size={22} />}
              title="Nothing left to recommend"
              description="All topics are completed and none are due for revision. Add a new subject or topic to keep learning."
              action={<ButtonLink to="/subjects">Manage subjects</ButtonLink>}
            />
          )}
        </Card>

        <Card title="Weekly activity" description={`${formatMinutes(weeklyMinutes)} studied in the last 7 days`}>
          <ChartFrame height={220} label="Bar chart of study minutes per day over the last seven days">
            <BarChart data={weekly} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} />
              <XAxis dataKey="label" {...axisProps} />
              <YAxis {...axisProps} allowDecimals={false} />
              <Tooltip {...tooltipProps} formatter={(v: number) => [`${v} min`, 'Study time']} />
              <Bar dataKey="minutes" radius={[6, 6, 0, 0]} maxBarSize={28}>
                {weekly.map((d, i) => (
                  <Cell key={d.date} fill={i === weekly.length - 1 ? CHART_COLORS.accent : CHART_COLORS.primary} />
                ))}
              </Bar>
            </BarChart>
          </ChartFrame>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Learning progress" description="Completed topics per subject" actions={<Link to="/progress" className="text-xs font-semibold text-brand-700 hover:underline">Details</Link>}>
          {subjectProgress.length === 0 ? (
            <EmptyState icon={<Layers size={22} />} title="No subjects yet" action={<ButtonLink to="/subjects">Add a subject</ButtonLink>} />
          ) : (
            <ul className="space-y-4">
              {subjectProgress.map((s) => (
                <li key={s.id}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <Link to={`/subjects/${s.id}`} className="flex items-center gap-2 font-medium text-slate-700 hover:text-brand-700">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                      {s.name}
                    </Link>
                    <span className="text-xs text-slate-500">
                      {s.done}/{s.total} topics
                    </span>
                  </div>
                  <ProgressBar value={s.pct} label={`${s.name} progress`} tone={s.pct === 100 ? 'success' : 'brand'} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Recent assessments" actions={<Link to="/performance" className="text-xs font-semibold text-brand-700 hover:underline">Performance analysis</Link>} bodyClassName="p-0">
          {recent.length === 0 ? (
            <EmptyState
              icon={<ClipboardCheck size={22} />}
              title="No assessments yet"
              description="Take a diagnostic assessment so the engine can measure your knowledge gaps."
              action={<ButtonLink to="/assessment">Browse assessments</ButtonLink>}
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {recent.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">{topicById.get(r.topicId)?.name ?? 'Deleted topic'}</p>
                    <p className="text-xs text-slate-500">
                      {subjectById.get(r.subjectId)?.name} · {formatDateTime(r.completedAt)}
                    </p>
                  </div>
                  <PerformanceBadge score={r.score} thresholds={thresholds} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
