import type { PriorityFactors, PriorityWeights } from '@/types';
import { priorityContributions } from '@/lib/engine/pbwps';
import { FACTOR_COLORS } from './WeightsEditor';

const LABELS: Record<keyof PriorityFactors, string> = { gap: 'Gap', difficulty: 'Difficulty', importance: 'Importance', revision: 'Revision' };

/** Stacked bar showing how much each weighted factor contributes to P (0–100). */
export function FactorBar({ factors, weights }: { factors: PriorityFactors; weights: PriorityWeights }) {
  const c = priorityContributions(factors, weights);
  const keys = Object.keys(LABELS) as (keyof PriorityFactors)[];
  const title = keys.map((k) => `${LABELS[k]}: ${Math.round(factors[k])} → +${c[k].toFixed(1)}`).join('\n');
  return (
    <div title={title}>
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-100" aria-label={`Priority breakdown. ${title.replace(/\n/g, '; ')}`} role="img">
        {keys.map((k) => (
          <div key={k} style={{ width: `${c[k]}%`, backgroundColor: FACTOR_COLORS[k] }} />
        ))}
      </div>
      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-slate-500">
        {keys.map((k) => (
          <span key={k}>
            {LABELS[k]} <span className="font-medium text-slate-700">{Math.round(factors[k])}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
