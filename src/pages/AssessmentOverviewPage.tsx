import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardCheck, History, Lock, Search } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { useEngineConfig, useLookups, usePerformance, useTopicSignals } from '@/hooks/useEngine';
import { validatePrerequisites } from '@/lib/engine/pbwps';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { PerformanceBadge } from '@/components/domain/Badges';
import { formatDateTime } from '@/lib/date';
import { pluralize } from '@/lib/format';

type Filter = 'all' | 'unassessed' | 'weak' | 'assessed';

export default function AssessmentOverviewPage() {
  const subjects = useAppStore((s) => s.subjects);
  const topics = useAppStore((s) => s.topics);
  const results = useAppStore((s) => s.results);
  const thresholds = useAppStore((s) => s.settings.thresholds);
  const { topicPerf } = usePerformance();
  const signals = useTopicSignals();
  const config = useEngineConfig();
  const { topicById, subjectById } = useLookups();

  const [subjectId, setSubjectId] = useState('all');
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [historyLimit, setHistoryLimit] = useState(10);

  const perfById = useMemo(() => new Map(topicPerf.map((p) => [p.topicId, p])), [topicPerf]);
  const signalById = useMemo(() => new Map(signals.map((s) => [s.id, s])), [signals]);

  const visible = topics.filter((t) => {
    if (!subjectById.has(t.subjectId)) return false;
    if (subjectId !== 'all' && t.subjectId !== subjectId) return false;
    if (query && !t.name.toLowerCase().includes(query.toLowerCase())) return false;
    const p = perfById.get(t.id);
    if (filter === 'unassessed') return !p;
    if (filter === 'assessed') return Boolean(p);
    if (filter === 'weak') return Boolean(p && p.latest < thresholds.developing);
    return true;
  });

  const history = useMemo(() => [...results].sort((a, b) => b.completedAt.localeCompare(a.completedAt)), [results]);

  return (
    <>
      <PageHeader
        title="Assessments"
        description="Each topic has a multiple-choice assessment. Your latest score per topic becomes its knowledge gap in the recommendation engine."
      />

      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative md:w-72">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Search topics…" aria-label="Search topics" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <select className="input md:w-60" aria-label="Filter by subject" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
          <option value="all">All subjects</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <div className="flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1" role="group" aria-label="Filter by assessment status">
          {(['all', 'unassessed', 'weak', 'assessed'] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={`rounded-md px-3 py-1 text-xs font-medium capitalize ${filter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              {f === 'weak' ? 'Weak topics' : f}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="card">
          <EmptyState icon={<ClipboardCheck size={22} />} title="No assessments match these filters" description="Try another subject or filter." />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((t) => {
            const p = perfById.get(t.id);
            const signal = signalById.get(t.id);
            const locked = signal ? !validatePrerequisites(signal, signalById, config.prerequisiteMastery).satisfied && signal.status !== 'completed' : false;
            return (
              <article key={t.id} className="card flex flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-medium" style={{ color: subjectById.get(t.subjectId)?.color }}>
                      {subjectById.get(t.subjectId)?.name}
                    </p>
                    <h3 className="mt-0.5 font-semibold text-slate-900">{t.name}</h3>
                  </div>
                  <PerformanceBadge score={p?.latest ?? null} thresholds={thresholds} />
                </div>
                <p className="mt-2 flex-1 text-sm text-slate-500">{t.description}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                  <span>{pluralize(t.questions.length, 'question')}</span>
                  {p && <span>· {pluralize(p.attempts, 'attempt')}</span>}
                  {p && <span>· best {p.best}%</span>}
                </div>
                {locked && (
                  <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                    <Lock size={12} /> Prerequisites not yet mastered — you can still take a diagnostic attempt.
                  </p>
                )}
                <div className="mt-4">
                  {t.questions.length === 0 ? (
                    <Badge tone="warning">No questions yet — add some in Subjects</Badge>
                  ) : (
                    <ButtonLink to={`/assessment/${t.id}`} size="sm" variant={p ? 'secondary' : 'primary'} icon={<ClipboardCheck size={14} />}>
                      {p ? 'Retake assessment' : 'Start assessment'}
                    </ButtonLink>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Card
        className="mt-8"
        title={
          <span className="flex items-center gap-2">
            <History size={16} /> Attempt history
          </span>
        }
        description={`${pluralize(results.length, 'attempt')} recorded`}
        bodyClassName="p-0"
      >
        {history.length === 0 ? (
          <EmptyState icon={<History size={22} />} title="No attempts yet" description="Completed assessments will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Topic</th>
                  <th className="px-5 py-3 font-medium">Subject</th>
                  <th className="px-5 py-3 font-medium">Score</th>
                  <th className="px-5 py-3 font-medium">Correct</th>
                  <th className="px-5 py-3 font-medium">Duration</th>
                  <th className="px-5 py-3 font-medium">Completed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.slice(0, historyLimit).map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3 font-medium text-slate-800">
                      <Link to={`/assessment/${r.topicId}`} className="hover:text-brand-700">
                        {topicById.get(r.topicId)?.name ?? 'Deleted topic'}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{subjectById.get(r.subjectId)?.name}</td>
                    <td className="px-5 py-3">
                      <PerformanceBadge score={r.score} thresholds={thresholds} />
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {r.correctCount}/{r.totalQuestions}
                    </td>
                    <td className="px-5 py-3 text-slate-600">{Math.max(1, Math.round(r.durationSeconds / 60))} min</td>
                    <td className="px-5 py-3 text-slate-600">{formatDateTime(r.completedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {history.length > historyLimit && (
              <div className="border-t border-slate-100 p-3 text-center">
                <button type="button" className="text-sm font-medium text-brand-700 hover:underline" onClick={() => setHistoryLimit((n) => n + 20)}>
                  Show more ({history.length - historyLimit} remaining)
                </button>
              </div>
            )}
          </div>
        )}
      </Card>
    </>
  );
}
