import { useMemo, useState, type ChangeEvent } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertTriangle, Download, FlaskConical, Play } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import {
  DEFAULT_EXPERIMENT_CONFIG,
  generateSimulatedProfiles,
  runExperiment,
  type CurriculumTopic,
  type ExperimentConfig,
  type ExperimentResult,
  type MetricValues,
} from '@/lib/engine/experiments';
import { normalizeWeights } from '@/lib/engine/pbwps';
import { downloadFile, toCsv } from '@/lib/storage/exportImport';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { EmptyState } from '@/components/ui/EmptyState';
import { ChartFrame, CHART_COLORS, axisProps, tooltipProps } from '@/components/domain/charts';
import { toast } from '@/store/toastStore';

const METRICS: { key: keyof MetricValues; label: string; description: string; percent: boolean; higherIsBetter: boolean }[] = [
  { key: 'weakTopicIdentification', label: 'Weak Topic Identification Rate', description: 'Share of genuinely weak, incomplete topics (true mastery below the weak threshold) that appear in the top-K list, normalised by min(K, number of weak topics).', percent: true, higherIsBetter: true },
  { key: 'relevance', label: 'Recommendation Relevance (nDCG@K)', description: 'Normalised discounted cumulative gain of the top-K list, using each topic’s hidden true knowledge gap (100 − true mastery) as graded relevance.', percent: true, higherIsBetter: true },
  { key: 'prerequisiteCompliance', label: 'Prerequisite Compliance', description: 'Share of top-K recommendations whose prerequisites are already satisfied (completed or scored at/above the mastery score).', percent: true, higherIsBetter: true },
  { key: 'pathCompletion', label: 'Learning Path Completion Rate', description: 'A simulated learner follows each method’s full sequence with a fixed study budget; a step fails (costing 30 min) when its prerequisites are not yet mastered. Rate = successful steps ÷ attempted steps.', percent: true, higherIsBetter: true },
  { key: 'generationTimeMs', label: 'Recommendation Generation Time', description: 'Mean wall-clock time to compute one ranking and sequence in this browser. Depends on your device.', percent: false, higherIsBetter: false },
];

const METHOD_COLORS = { A: CHART_COLORS.muted, B: CHART_COLORS.warning, C: CHART_COLORS.primary } as const;

export default function ExperimentsPage() {
  const subjects = useAppStore((s) => s.subjects);
  const topics = useAppStore((s) => s.topics);
  const engine = useAppStore((s) => s.settings.engine);
  const thresholds = useAppStore((s) => s.settings.thresholds);
  const [config, setConfig] = useState<ExperimentConfig>(DEFAULT_EXPERIMENT_CONFIG);
  const [result, setResult] = useState<ExperimentResult | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const curriculum: CurriculumTopic[] = useMemo(() => {
    const index = new Map(subjects.map((s, i) => [s.id, i]));
    return topics
      .filter((t) => index.has(t.subjectId))
      .map((t) => ({ id: t.id, name: t.name, subjectId: t.subjectId, difficulty: t.difficulty, importance: t.importance, estimatedMinutes: t.estimatedMinutes, prerequisites: t.prerequisites, order: index.get(t.subjectId)! * 1000 + t.order }));
  }, [subjects, topics]);

  const preview = useMemo(() => (curriculum.length ? generateSimulatedProfiles(curriculum, { ...config, profileCount: Math.min(config.profileCount, 6) }) : []), [curriculum, config]);

  const validate = (): string | null => {
    if (curriculum.length < 2) return 'At least two topics are needed to run an experiment.';
    if (!Number.isInteger(config.seed)) return 'Seed must be a whole number.';
    if (!(config.profileCount >= 100 && config.profileCount <= 1000)) return 'Use between 100 and 1000 simulated profiles.';
    if (!(config.topK >= 1 && config.topK <= 20)) return 'Top-K must be between 1 and 20.';
    if (!(config.weakThreshold > 0 && config.weakThreshold < 100)) return 'Weak threshold must be between 1 and 99.';
    if (!(config.studyBudgetMinutes >= 60 && config.studyBudgetMinutes <= 6000)) return 'Study budget must be 60–6000 minutes.';
    return null;
  };

  const run = () => {
    const problem = validate();
    setError(problem);
    if (problem) return;
    setRunning(true);
    // Yield to the browser so the loading state renders before the computation.
    setTimeout(() => {
      try {
        const r = runExperiment(curriculum, engine, thresholds, config);
        setResult(r);
        toast(`Experiment finished: ${r.profileCount} simulated profiles evaluated.`);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'The experiment failed.');
      } finally {
        setRunning(false);
      }
    }, 30);
  };

  const exportResults = (format: 'json' | 'csv') => {
    if (!result) return;
    if (format === 'json') {
      downloadFile(`pbwps-experiment-seed${result.config.seed}.json`, JSON.stringify({ ...result, weights: normalizeWeights(engine.weights), note: 'Simulated profiles — not real student outcomes.' }, null, 2), 'application/json');
    } else {
      const rows = result.methods.flatMap((m) => METRICS.map((k) => [m.method, m.name, k.label, m.mean[k.key].toFixed(4), m.sd[k.key].toFixed(4)]));
      downloadFile(`pbwps-experiment-seed${result.config.seed}.csv`, toCsv(['Method', 'Name', 'Metric', 'Mean', 'SD'], rows), 'text/csv');
    }
  };

  const chartData = result
    ? METRICS.filter((m) => m.percent).map((m) => ({
        metric: m.label.replace('Recommendation ', '').replace(' (nDCG@K)', '').replace('Learning Path ', 'Path '),
        A: +(result.methods[0].mean[m.key] * 100).toFixed(1),
        B: +(result.methods[1].mean[m.key] * 100).toFixed(1),
        C: +(result.methods[2].mean[m.key] * 100).toFixed(1),
      }))
    : [];

  const num = (key: keyof ExperimentConfig) => (e: ChangeEvent<HTMLInputElement>) => setConfig({ ...config, [key]: e.target.valueAsNumber });

  return (
    <>
      <PageHeader
        title="Algorithm Experiments"
        description="Compare Method A (Equal Priority), Method B (Performance-Based) and Method C (proposed PBWPS) on reproducible simulated student profiles."
      />

      <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900" role="note">
        <AlertTriangle size={18} className="mt-0.5 shrink-0" />
        <p>
          <strong>Simulated evaluation.</strong> Every result on this page is computed from synthetic student profiles generated by a seeded pseudo-random process with a
          known “true mastery” per topic. The numbers describe algorithm behaviour on that synthetic data only. They are <strong>not</strong> evidence of real learning
          outcomes, which still require validation with real students.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Experiment configuration" description="The same seed always produces the same profiles and quality metrics.">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Random seed" htmlFor="ex-seed">
                <input id="ex-seed" type="number" className="input" value={config.seed} onChange={num('seed')} />
              </Field>
              <Field label="Profiles" htmlFor="ex-n" hint="100–1000">
                <input id="ex-n" type="number" min={100} max={1000} step={10} className="input" value={config.profileCount} onChange={num('profileCount')} />
              </Field>
              <Field label="Top-K" htmlFor="ex-k">
                <input id="ex-k" type="number" min={1} max={20} className="input" value={config.topK} onChange={num('topK')} />
              </Field>
              <Field label="Weak threshold" htmlFor="ex-weak" hint="true mastery %">
                <input id="ex-weak" type="number" min={1} max={99} className="input" value={config.weakThreshold} onChange={num('weakThreshold')} />
              </Field>
            </div>
            <Field label="Simulated study budget (minutes)" htmlFor="ex-budget">
              <input id="ex-budget" type="number" min={60} max={6000} step={60} className="input" value={config.studyBudgetMinutes} onChange={num('studyBudgetMinutes')} />
            </Field>
            <p className="text-xs text-slate-500">
              Uses your current curriculum ({curriculum.length} topics) and PBWPS settings (weights {Object.values(normalizeWeights(engine.weights)).map((w) => w.toFixed(2)).join(' / ')}, mastery {engine.prerequisiteMastery}%).
            </p>
            {error && (
              <p className="text-sm font-medium text-red-600" role="alert">
                {error}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button onClick={run} disabled={running} icon={<Play size={16} />}>
                {running ? 'Running…' : 'Run experiment'}
              </Button>
              <Button variant="secondary" onClick={() => setConfig(DEFAULT_EXPERIMENT_CONFIG)} disabled={running}>
                Defaults
              </Button>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2" title="Dataset preview" description={`First simulated profiles for seed ${config.seed}`} bodyClassName="p-0">
          {preview.length === 0 ? (
            <EmptyState icon={<FlaskConical size={22} />} title="No curriculum" description="Add topics to generate simulated profiles." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-medium">Profile</th>
                    <th className="px-5 py-3 font-medium">Ability</th>
                    <th className="px-5 py-3 font-medium">Assessed</th>
                    <th className="px-5 py-3 font-medium">Completed</th>
                    <th className="px-5 py-3 font-medium">Truly weak (incomplete)</th>
                    <th className="px-5 py-3 font-medium">Mean observed score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {preview.map((p) => {
                    const assessed = p.signals.filter((s) => s.latestScore !== null);
                    return (
                      <tr key={p.id}>
                        <td className="px-5 py-2.5 font-mono text-xs">{p.id}</td>
                        <td className="px-5 py-2.5">{p.ability}</td>
                        <td className="px-5 py-2.5">{assessed.length}</td>
                        <td className="px-5 py-2.5">{p.signals.filter((s) => s.status === 'completed').length}</td>
                        <td className="px-5 py-2.5">{p.signals.filter((s) => s.status !== 'completed' && p.trueMastery[s.id] < config.weakThreshold).length}</td>
                        <td className="px-5 py-2.5">{assessed.length ? `${(assessed.reduce((m, s) => m + s.latestScore!, 0) / assessed.length).toFixed(1)}%` : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {result ? (
        <>
          <Card
            className="mt-6"
            title="Results"
            description={`${result.profileCount} simulated profiles · ${result.topicCount} topics · avg. ${result.averageWeakTopics.toFixed(1)} truly weak topics per profile · top-K = ${result.config.topK} · seed ${result.config.seed}`}
            actions={
              <>
                <Button size="sm" variant="secondary" icon={<Download size={14} />} onClick={() => exportResults('csv')}>
                  CSV
                </Button>
                <Button size="sm" variant="secondary" icon={<Download size={14} />} onClick={() => exportResults('json')}>
                  JSON
                </Button>
              </>
            }
            bodyClassName="p-0"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-medium">Metric</th>
                    {result.methods.map((m) => (
                      <th key={m.method} className="px-5 py-3 font-medium">
                        {m.method}: {m.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {METRICS.map((metric) => {
                    const values = result.methods.map((m) => m.mean[metric.key]);
                    const best = metric.higherIsBetter ? Math.max(...values) : Math.min(...values);
                    return (
                      <tr key={metric.key}>
                        <td className="px-5 py-3 font-medium text-slate-800">{metric.label}</td>
                        {result.methods.map((m) => {
                          const v = m.mean[metric.key];
                          const isBest = Math.abs(v - best) < 1e-9;
                          return (
                            <td key={m.method} className={`px-5 py-3 ${isBest ? 'font-semibold text-emerald-700' : 'text-slate-600'}`}>
                              {metric.percent ? `${(v * 100).toFixed(1)}%` : `${v.toFixed(3)} ms`}
                              <span className="ml-1 text-xs font-normal text-slate-400">± {metric.percent ? (m.sd[metric.key] * 100).toFixed(1) : m.sd[metric.key].toFixed(3)}</span>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
              Mean ± standard deviation across profiles. Best value per metric in green. Simulated data — generation time varies between devices and runs.
            </p>
          </Card>

          <Card className="mt-6" title="Quality metrics by method" description="Simulated profiles, percentages">
            <ChartFrame height={300} label="Grouped bar chart comparing methods A, B and C on four quality metrics">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} />
                <XAxis dataKey="metric" {...axisProps} interval={0} />
                <YAxis domain={[0, 100]} {...axisProps} />
                <Tooltip {...tooltipProps} formatter={(v: number, name: string) => [`${v}%`, `Method ${name}`]} />
                <Legend formatter={(v) => `Method ${v}`} wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="A" fill={METHOD_COLORS.A} radius={[4, 4, 0, 0]} maxBarSize={32} />
                <Bar dataKey="B" fill={METHOD_COLORS.B} radius={[4, 4, 0, 0]} maxBarSize={32} />
                <Bar dataKey="C" fill={METHOD_COLORS.C} radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ChartFrame>
          </Card>
        </>
      ) : (
        <div className="card mt-6">
          <EmptyState
            icon={<FlaskConical size={22} />}
            title="No experiment run yet"
            description="Configure the parameters and run the experiment to compute real metrics for this curriculum. Nothing is pre-filled or fabricated."
            action={
              <Button onClick={run} disabled={running} icon={<Play size={16} />}>
                Run experiment
              </Button>
            }
          />
        </div>
      )}

      <Card className="mt-6" title="Metric definitions">
        <dl className="grid gap-4 md:grid-cols-2">
          {METRICS.map((m) => (
            <div key={m.key}>
              <dt className="text-sm font-semibold text-slate-800">{m.label}</dt>
              <dd className="mt-0.5 text-sm text-slate-600">{m.description}</dd>
            </div>
          ))}
          <div>
            <dt className="text-sm font-semibold text-slate-800">Simulation model</dt>
            <dd className="mt-0.5 text-sm text-slate-600">
              Each profile has a latent ability (normal, mean 60, SD 16). True topic mastery depends on ability, topic difficulty and prerequisite mastery. 30–80% of topics are
              observed through a noisy 5-question assessment (scores in steps of 20). Topics are marked completed only when observed ≥ 60% and prerequisites are completed.
            </dd>
          </div>
        </dl>
      </Card>
    </>
  );
}
