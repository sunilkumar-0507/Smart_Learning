import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ClipboardCheck, Clock, Lock, Play, RefreshCw, Route, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { useLearningPath, useLookups, useRanking } from '@/hooks/useEngine';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatCard } from '@/components/ui/StatCard';
import { PriorityBadge, StatusBadge } from '@/components/domain/Badges';
import { toast } from '@/store/toastStore';
import { formatDate } from '@/lib/date';
import { formatMinutes } from '@/lib/format';

export default function LearningPathPage() {
  const subjects = useAppStore((s) => s.subjects);
  const topics = useAppStore((s) => s.topics);
  const progress = useAppStore((s) => s.progress);
  const startTopic = useAppStore((s) => s.startTopic);
  const completeTopic = useAppStore((s) => s.completeTopic);
  const reviewTopic = useAppStore((s) => s.reviewTopic);
  const path = useLearningPath();
  const { recommendations } = useRanking();
  const { topicById, subjectById } = useLookups();
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [limit, setLimit] = useState(15);

  const steps = useMemo(() => path.filter((s) => subjectFilter === 'all' || topicById.get(s.topicId)?.subjectId === subjectFilter), [path, subjectFilter, topicById]);
  const completed = useMemo(
    () =>
      topics
        .filter((t) => progress[t.id]?.status === 'completed' && subjectById.has(t.subjectId))
        .filter((t) => subjectFilter === 'all' || t.subjectId === subjectFilter)
        .sort((a, b) => (progress[b.id]?.completedAt ?? '').localeCompare(progress[a.id]?.completedAt ?? '')),
    [topics, progress, subjectById, subjectFilter],
  );
  const reviewDue = new Set(recommendations.filter((r) => r.kind === 'review').map((r) => r.topicId));
  const nextUp = path.filter((s) => s.availableNow && !s.blockedByCycle).slice(0, 3);
  const totalMinutes = path.reduce((m, s) => m + s.estimatedMinutes, 0);
  const availableCount = path.filter((s) => s.availableNow).length;

  return (
    <>
      <PageHeader
        title="Personalised Learning Path"
        description="A prerequisite-safe sequence of every topic you have not completed. Among the topics you can study at each step, the highest PBWPS priority comes first. The path re-plans itself after every assessment or completion."
        actions={
          <select className="input w-auto" aria-label="Filter by subject" value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
            <option value="all">All subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Topics in path" value={path.length} hint={`${completed.length} completed${subjectFilter === 'all' ? '' : ' in this subject'}`} icon={<Route size={20} />} />
        <StatCard label="Available now" value={availableCount} hint={`${path.length - availableCount} waiting for prerequisites`} icon={<Play size={20} />} tone="success" />
        <StatCard label="Remaining study time" value={formatMinutes(totalMinutes)} hint="Sum of estimated topic durations" icon={<Clock size={20} />} tone="info" />
      </div>

      {nextUp.length > 0 && (
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {nextUp.map((s, i) => {
            const topic = topicById.get(s.topicId)!;
            return (
              <div key={s.topicId} className={`card p-5 ${i === 0 ? 'ring-2 ring-accent-400' : ''}`}>
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-accent-600">
                  <Sparkles size={13} /> {i === 0 ? 'Recommended next' : `Then #${i + 1}`}
                </p>
                <p className="mt-2 font-semibold text-slate-900">{topic.name}</p>
                <p className="text-xs text-slate-500">
                  {subjectById.get(topic.subjectId)?.name} · {formatMinutes(s.estimatedMinutes)}
                </p>
                <div className="mt-3">
                  <PriorityBadge level={s.level} score={s.priority} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2" title="Learning sequence" description="Follow the path from top to bottom" bodyClassName="p-5">
          {steps.length === 0 ? (
            <EmptyState icon={<CheckCircle2 size={22} />} title="Path complete" description="Every topic here is completed. Review topics below to keep them fresh." />
          ) : (
            <ol className="relative space-y-4 border-l-2 border-slate-100 pl-6">
              {steps.slice(0, limit).map((s) => {
                const topic = topicById.get(s.topicId)!;
                const status = progress[s.topicId]?.status ?? 'not-started';
                return (
                  <li key={s.topicId} className="relative">
                    <span
                      className={`absolute -left-[37px] top-3 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ring-4 ring-white ${
                        s.availableNow ? 'bg-brand-700 text-white' : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {s.availableNow ? s.position : <Lock size={11} />}
                    </span>
                    <div className={`rounded-xl border p-4 ${s.availableNow ? 'border-slate-200 bg-white' : 'border-dashed border-slate-200 bg-slate-50/60'}`}>
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900">
                            <span className="mr-1 text-slate-400">#{s.position}</span> {topic.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {subjectById.get(topic.subjectId)?.name} · {formatMinutes(s.estimatedMinutes)} · ends at {formatMinutes(s.cumulativeMinutes)} cumulative
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {s.weak && <Badge tone="danger">Weak</Badge>}
                          <StatusBadge status={status} />
                          <PriorityBadge level={s.level} score={s.priority} />
                        </div>
                      </div>
                      {topic.prerequisites.length > 0 && (
                        <p className="mt-2 text-xs text-slate-500">
                          Prerequisites:{' '}
                          {topic.prerequisites.map((p, i) => (
                            <span key={p}>
                              {i > 0 && ', '}
                              <span className={s.waitingFor.includes(p) ? 'font-medium text-amber-700' : 'text-emerald-700'}>
                                {topicById.get(p)?.name ?? 'removed'}
                                {s.waitingFor.includes(p) ? ' (pending)' : ' ✓'}
                              </span>
                            </span>
                          ))}
                        </p>
                      )}
                      {s.blockedByCycle && <p className="mt-2 text-xs font-medium text-amber-700">Blocked by a circular prerequisite chain — edit the topic’s prerequisites.</p>}
                      <p className="mt-2 text-xs text-slate-600">{s.reasons[0]}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {s.availableNow && status === 'not-started' && (
                          <Button size="sm" icon={<Play size={14} />} onClick={() => { startTopic(s.topicId); toast(`Started ${topic.name}.`); }}>
                            Start topic
                          </Button>
                        )}
                        {s.availableNow && (
                          <Button size="sm" variant="success" icon={<CheckCircle2 size={14} />} onClick={() => { completeTopic(s.topicId); toast(`${topic.name} completed — path updated.`); }}>
                            Mark completed
                          </Button>
                        )}
                        <ButtonLink size="sm" variant="secondary" to={`/assessment/${s.topicId}`} icon={<ClipboardCheck size={14} />}>
                          Assess
                        </ButtonLink>
                        <ButtonLink size="sm" variant="ghost" to={`/resources?topic=${s.topicId}`}>
                          Resources
                        </ButtonLink>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
          {steps.length > limit && (
            <div className="mt-4 text-center">
              <button type="button" className="text-sm font-medium text-brand-700 hover:underline" onClick={() => setLimit((l) => l + 15)}>
                Show more ({steps.length - limit} remaining)
              </button>
            </div>
          )}
        </Card>

        <Card title="Completed topics" description="Review to refresh them and reset their revision need" bodyClassName="p-0">
          {completed.length === 0 ? (
            <EmptyState icon={<CheckCircle2 size={22} />} title="No completed topics yet" description="Mark topics as completed when you have finished studying them." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {completed.map((t) => {
                const p = progress[t.id];
                return (
                  <li key={t.id} className="flex items-center justify-between gap-2 px-5 py-3">
                    <div className="min-w-0">
                      <Link to={`/subjects/${t.subjectId}`} className="block truncate text-sm font-medium text-slate-800 hover:text-brand-700">
                        {t.name}
                      </Link>
                      <p className="text-xs text-slate-500">
                        {p?.lastReviewedAt ? `Reviewed ${formatDate(p.lastReviewedAt)}` : p?.completedAt ? `Completed ${formatDate(p.completedAt)}` : 'Completed'}
                        {reviewDue.has(t.id) && <span className="ml-1 font-medium text-amber-700">· review due</span>}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant={reviewDue.has(t.id) ? 'primary' : 'secondary'}
                      icon={<RefreshCw size={13} />}
                      onClick={() => {
                        reviewTopic(t.id);
                        toast(`Logged a review of ${t.name}.`);
                      }}
                    >
                      Review
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
