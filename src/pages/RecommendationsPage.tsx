import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ChevronDown, ChevronRight, ClipboardCheck, Lock, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { useEngineConfig, useLookups, useRanking, useTopicSignals } from '@/hooks/useEngine';
import { METHOD_NAMES, runMethod, type MethodId } from '@/lib/engine/baselines';
import { validatePrerequisites } from '@/lib/engine/pbwps';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { PriorityBadge } from '@/components/domain/Badges';
import { WeightsEditor } from '@/components/domain/WeightsEditor';
import { FactorBar } from '@/components/domain/FactorBar';
import type { Recommendation } from '@/types';

function RecommendationRow({ rec, open, onToggle }: { rec: Recommendation; open: boolean; onToggle: () => void }) {
  const { topicById, subjectById } = useLookups();
  const weights = useAppStore((s) => s.settings.engine.weights);
  const topic = topicById.get(rec.topicId);
  if (!topic) return null;
  return (
    <li className="px-5 py-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${rec.locked ? 'bg-slate-100 text-slate-400' : 'bg-brand-50 text-brand-700'}`}>
          {rec.locked ? <Lock size={14} /> : rec.rank}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-slate-900">{topic.name}</span>
            {rec.kind === 'review' && <Badge tone="violet">Revision</Badge>}
            {rec.weak && <Badge tone="danger">Weak</Badge>}
            {!rec.assessed && <Badge>Not assessed</Badge>}
            {rec.inCycle && <Badge tone="warning">Cycle</Badge>}
          </div>
          <p className="text-xs text-slate-500">{subjectById.get(topic.subjectId)?.name}</p>
        </div>
        <div className="w-full md:w-64">
          <FactorBar factors={rec.factors} weights={weights} />
        </div>
        <div className="flex items-center gap-2 md:w-48 md:justify-end">
          <PriorityBadge level={rec.level} score={rec.priority} />
          <button type="button" onClick={onToggle} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-expanded={open} aria-label={`Why ${topic.name}?`}>
            {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>
      </div>
      {open && (
        <div className="mt-3 rounded-lg bg-slate-50 p-4 md:ml-11">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Why this recommendation</p>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            {rec.reasons.map((r) => (
              <li key={r} className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                {r}
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-wrap gap-2">
            <ButtonLink to={`/assessment/${topic.id}`} size="sm" variant="secondary" icon={<ClipboardCheck size={14} />}>
              Assess
            </ButtonLink>
            <ButtonLink to={`/resources?topic=${topic.id}`} size="sm" variant="ghost">
              Resources
            </ButtonLink>
          </div>
        </div>
      )}
    </li>
  );
}

export default function RecommendationsPage() {
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const { recommendations, locked, cycleTopicIds } = useRanking();
  const signals = useTopicSignals();
  const config = useEngineConfig();
  const { topicById } = useLookups();
  const [open, setOpen] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const comparison = useMemo(() => {
    const byId = new Map(signals.map((s) => [s.id, s]));
    return (['A', 'B', 'C'] as MethodId[]).map((m) => {
      const out = runMethod(m, signals, config);
      return {
        method: m,
        top: out.ranking.slice(0, 5).map((id) => ({ id, locked: !validatePrerequisites(byId.get(id)!, byId, config.prerequisiteMastery).satisfied })),
      };
    });
  }, [signals, config]);

  const visible = showAll ? recommendations : recommendations.slice(0, 10);

  return (
    <>
      <PageHeader
        title="Recommendation Engine"
        description="Performance-Based Weighted Priority Scheduling (PBWPS) ranks every topic that still needs work. Adjust the weights to see the ranking change instantly."
      />

      {cycleTopicIds.length > 0 && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800" role="alert">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <p>
            Circular prerequisites detected between: {cycleTopicIds.map((id) => topicById.get(id)?.name).join(', ')}. These topics cannot be unlocked until one of them is
            completed or the prerequisite is removed in <Link to="/subjects" className="font-semibold underline">Subjects</Link>.
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card
            title={
              <span className="flex items-center gap-2">
                <Sparkles size={16} className="text-accent-500" /> Ranked recommendations
              </span>
            }
            description={`${recommendations.length} available now · ${locked.length} locked by prerequisites`}
            bodyClassName="p-0"
          >
            {recommendations.length === 0 ? (
              <EmptyState icon={<Sparkles size={22} />} title="No recommendations right now" description="Every topic is completed and none is due for revision." />
            ) : (
              <ul className="divide-y divide-slate-100">
                {visible.map((r) => (
                  <RecommendationRow key={r.topicId} rec={r} open={open === r.topicId} onToggle={() => setOpen(open === r.topicId ? null : r.topicId)} />
                ))}
              </ul>
            )}
            {recommendations.length > 10 && (
              <div className="border-t border-slate-100 p-3 text-center">
                <button type="button" className="text-sm font-medium text-brand-700 hover:underline" onClick={() => setShowAll(!showAll)}>
                  {showAll ? 'Show top 10' : `Show all ${recommendations.length}`}
                </button>
              </div>
            )}
          </Card>

          {locked.length > 0 && (
            <Card
              title={
                <span className="flex items-center gap-2">
                  <Lock size={15} /> Locked topics
                </span>
              }
              description={`Not recommended until their prerequisites reach ${settings.engine.prerequisiteMastery}% or are completed`}
              bodyClassName="p-0"
            >
              <ul className="divide-y divide-slate-100">
                {locked.map((r) => (
                  <RecommendationRow key={r.topicId} rec={r} open={open === r.topicId} onToggle={() => setOpen(open === r.topicId ? null : r.topicId)} />
                ))}
              </ul>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card title="Priority weights" description="Changes apply immediately and are saved.">
            <WeightsEditor weights={settings.engine.weights} onChange={(weights) => updateSettings({ ...settings, engine: { ...settings.engine, weights } })} />
          </Card>

          <Card title="Method comparison" description="Top 5 for your current data under each method">
            <div className="space-y-4">
              {comparison.map((c) => (
                <div key={c.method}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Method {c.method}: {METHOD_NAMES[c.method]}
                  </p>
                  {c.top.length === 0 ? (
                    <p className="mt-1 text-sm text-slate-500">No topics.</p>
                  ) : (
                    <ol className="mt-1.5 space-y-1 text-sm">
                      {c.top.map((t, i) => (
                        <li key={t.id} className="flex items-center gap-2">
                          <span className="w-4 text-xs text-slate-400">{i + 1}.</span>
                          <span className={`flex-1 truncate ${t.locked ? 'text-slate-400' : 'text-slate-700'}`}>{topicById.get(t.id)?.name}</span>
                          {t.locked && (
                            <span className="flex items-center gap-1 text-[11px] text-red-600">
                              <Lock size={11} /> locked
                            </span>
                          )}
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              ))}
              <p className="text-xs text-slate-500">
                Method B can recommend topics whose prerequisites are not mastered. Run the full evaluation on{' '}
                <Link to="/experiments" className="font-medium text-brand-700 hover:underline">
                  Experiments
                </Link>
                .
              </p>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
