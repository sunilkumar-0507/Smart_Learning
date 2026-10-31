import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, ReferenceLine, Tooltip, XAxis, YAxis } from 'recharts';
import { Award, BarChart3, ClipboardCheck, Target, TrendingDown, TrendingUp } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { useLookups, usePerformance } from '@/hooks/useEngine';
import { classifyPerformance, type PerformanceBand } from '@/lib/engine/performance';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { ButtonLink } from '@/components/ui/Button';
import { PerformanceBadge, bandColors } from '@/components/domain/Badges';
import { ChartFrame, CHART_COLORS, axisProps, tooltipProps } from '@/components/domain/charts';
import { formatDate } from '@/lib/date';

type SortKey = 'latest' | 'improvement' | 'attempts' | 'name';
const BANDS: PerformanceBand[] = ['Needs Improvement', 'Developing', 'Good', 'Excellent'];

export default function PerformancePage() {
  const thresholds = useAppStore((s) => s.settings.thresholds);
  const subjects = useAppStore((s) => s.subjects);
  const { topicPerf, subjectPerf, overall, improvement, trend } = usePerformance();
  const { topicById } = useLookups();
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [sort, setSort] = useState<SortKey>('latest');

  const rows = useMemo(() => {
    const list = topicPerf
      .filter((p) => topicById.has(p.topicId))
      .filter((p) => subjectFilter === 'all' || p.subjectId === subjectFilter)
      .map((p) => ({ ...p, name: topicById.get(p.topicId)!.name, band: classifyPerformance(p.latest, thresholds) }));
    const sorters: Record<SortKey, (a: (typeof list)[number], b: (typeof list)[number]) => number> = {
      latest: (a, b) => a.latest - b.latest,
      improvement: (a, b) => b.improvement - a.improvement,
      attempts: (a, b) => b.attempts - a.attempts,
      name: (a, b) => a.name.localeCompare(b.name),
    };
    return list.sort(sorters[sort]);
  }, [topicPerf, topicById, subjectFilter, sort, thresholds]);

  const strong = topicPerf.filter((p) => p.latest >= thresholds.good).sort((a, b) => b.latest - a.latest);
  const weak = topicPerf.filter((p) => p.latest < thresholds.developing).sort((a, b) => a.latest - b.latest);
  const distribution = BANDS.map((band) => ({ band, count: topicPerf.filter((p) => classifyPerformance(p.latest, thresholds) === band).length }));
  const subjectChart = subjectPerf.filter((s) => s.average !== null).map((s) => ({ name: s.name, average: Math.round(s.average! * 10) / 10, color: s.color }));
  const trendData = trend.map((t) => ({ ...t, label: formatDate(t.date, { day: 'numeric', month: 'short' }), topic: topicById.get(t.topicId)?.name }));

  if (topicPerf.length === 0) {
    return (
      <>
        <PageHeader title="Performance Analysis" description="Topic-wise and subject-wise analysis of your assessment results." />
        <div className="card">
          <EmptyState
            icon={<BarChart3 size={22} />}
            title="No assessment data yet"
            description="Complete at least one topic assessment to unlock performance analytics."
            action={<ButtonLink to="/assessment">Take an assessment</ButtonLink>}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Performance Analysis"
        description={
          <>
            Bands: below {thresholds.developing}% Needs Improvement · {thresholds.developing}–{thresholds.good}% Developing · {thresholds.good}–{thresholds.excellent}% Good · {thresholds.excellent}%+ Excellent.{' '}
            <Link to="/settings" className="font-medium text-brand-700 hover:underline">
              Change thresholds
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Overall score" value={`${overall!.toFixed(1)}%`} hint={classifyPerformance(overall!, thresholds)} icon={<Target size={20} />} tone="violet" />
        <StatCard label="Assessed topics" value={topicPerf.length} hint={`${trend.length} attempts in total`} icon={<ClipboardCheck size={20} />} />
        <StatCard label="Strong / weak" value={`${strong.length} / ${weak.length}`} hint={`≥ ${thresholds.good}% vs < ${thresholds.developing}%`} icon={<Award size={20} />} tone="success" />
        <StatCard
          label="Improvement"
          value={improvement.topicsCompared ? `${improvement.averagePointChange >= 0 ? '+' : ''}${improvement.averagePointChange.toFixed(1)} pts` : '—'}
          hint={improvement.topicsCompared ? `${improvement.relativeChange >= 0 ? '+' : ''}${improvement.relativeChange.toFixed(1)}% across ${improvement.topicsCompared} retaken topics` : 'Retake a topic to measure improvement'}
          icon={improvement.averagePointChange >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
          tone={improvement.averagePointChange >= 0 ? 'success' : 'danger'}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Subject-wise performance" description="Mean of the latest score of each assessed topic">
          <ChartFrame label="Bar chart of average score per subject">
            <BarChart data={subjectChart} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
              <CartesianGrid horizontal={false} stroke={CHART_COLORS.grid} />
              <XAxis type="number" domain={[0, 100]} {...axisProps} />
              <YAxis type="category" dataKey="name" width={150} {...axisProps} />
              <Tooltip {...tooltipProps} formatter={(v: number) => [`${v}%`, 'Average']} />
              <ReferenceLine x={thresholds.developing} stroke={CHART_COLORS.warning} strokeDasharray="4 4" />
              <Bar dataKey="average" radius={[0, 6, 6, 0]} maxBarSize={22}>
                {subjectChart.map((s) => (
                  <Cell key={s.name} fill={s.color} />
                ))}
              </Bar>
            </BarChart>
          </ChartFrame>
        </Card>

        <Card title="Performance trend" description="Score of every attempt, with the running average">
          <ChartFrame label="Line chart of assessment scores over time">
            <LineChart data={trendData} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} />
              <XAxis dataKey="label" {...axisProps} minTickGap={24} />
              <YAxis domain={[0, 100]} {...axisProps} />
              <Tooltip
                {...tooltipProps}
                labelFormatter={(_, payload) => (payload?.[0]?.payload as { topic?: string } | undefined)?.topic ?? ''}
                formatter={(v: number, name: string) => [`${v}%`, name === 'score' ? 'Attempt score' : 'Running average']}
              />
              <Legend formatter={(v) => (v === 'score' ? 'Attempt score' : 'Running average')} wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="score" stroke={CHART_COLORS.muted} strokeWidth={1.5} dot={{ r: 3, fill: CHART_COLORS.primary, stroke: 'none' }} />
              <Line type="monotone" dataKey="runningAverage" stroke={CHART_COLORS.accent} strokeWidth={2.5} dot={false} />
            </LineChart>
          </ChartFrame>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card title="Performance bands" description="Topics by latest score">
          <ChartFrame height={220} label="Bar chart of topic counts per performance band">
            <BarChart data={distribution} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} />
              <XAxis dataKey="band" {...axisProps} tickFormatter={(b: string) => (b === 'Needs Improvement' ? 'Needs impr.' : b)} />
              <YAxis allowDecimals={false} {...axisProps} />
              <Tooltip {...tooltipProps} formatter={(v: number) => [v, 'Topics']} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={40}>
                {distribution.map((d) => (
                  <Cell key={d.band} fill={bandColors[d.band]} />
                ))}
              </Bar>
            </BarChart>
          </ChartFrame>
        </Card>

        <Card title="Strong topics" description={`Latest score ≥ ${thresholds.good}%`}>
          {strong.length === 0 ? (
            <p className="text-sm text-slate-500">No strong topics yet — keep practising.</p>
          ) : (
            <ul className="space-y-2">
              {strong.slice(0, 6).map((p) => (
                <li key={p.topicId} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate text-slate-700">{topicById.get(p.topicId)?.name}</span>
                  <PerformanceBadge score={p.latest} thresholds={thresholds} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Weak topics" description={`Latest score < ${thresholds.developing}% — prioritised by the engine`}>
          {weak.length === 0 ? (
            <p className="text-sm text-slate-500">No weak topics. Great work!</p>
          ) : (
            <ul className="space-y-2">
              {weak.slice(0, 6).map((p) => (
                <li key={p.topicId} className="flex items-center justify-between gap-2 text-sm">
                  <Link to={`/assessment/${p.topicId}`} className="truncate text-slate-700 hover:text-brand-700">
                    {topicById.get(p.topicId)?.name}
                  </Link>
                  <PerformanceBadge score={p.latest} thresholds={thresholds} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card
        className="mt-6"
        title="Topic-wise scores"
        bodyClassName="p-0"
        actions={
          <>
            <select className="input w-auto py-1.5 text-xs" aria-label="Filter by subject" value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
              <option value="all">All subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <select className="input w-auto py-1.5 text-xs" aria-label="Sort topics" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
              <option value="latest">Lowest latest score first</option>
              <option value="improvement">Most improved first</option>
              <option value="attempts">Most attempts first</option>
              <option value="name">Name A–Z</option>
            </select>
          </>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Topic</th>
                <th className="px-5 py-3 font-medium">Attempts</th>
                <th className="px-5 py-3 font-medium">First</th>
                <th className="px-5 py-3 font-medium">Best</th>
                <th className="px-5 py-3 font-medium">Change</th>
                <th className="px-5 py-3 font-medium">Latest</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r.topicId}>
                  <td className="px-5 py-3 font-medium text-slate-800">{r.name}</td>
                  <td className="px-5 py-3 text-slate-600">{r.attempts}</td>
                  <td className="px-5 py-3 text-slate-600">{r.first}%</td>
                  <td className="px-5 py-3 text-slate-600">{r.best}%</td>
                  <td className={`px-5 py-3 font-medium ${r.improvement > 0 ? 'text-emerald-600' : r.improvement < 0 ? 'text-red-600' : 'text-slate-400'}`}>
                    {r.attempts < 2 ? '—' : `${r.improvement > 0 ? '+' : ''}${r.improvement} pts`}
                  </td>
                  <td className="px-5 py-3">
                    <PerformanceBadge score={r.latest} thresholds={thresholds} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <p className="p-5 text-sm text-slate-500">No assessed topics in this subject.</p>}
        </div>
      </Card>
    </>
  );
}
