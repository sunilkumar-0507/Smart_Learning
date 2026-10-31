import type { PriorityWeights } from '@/types';
import { DEFAULT_WEIGHTS, normalizeWeights } from '@/lib/engine/pbwps';
import { Button } from '@/components/ui/Button';

const FACTORS: { key: keyof PriorityWeights; label: string; symbol: string; help: string }[] = [
  { key: 'gap', label: 'Knowledge gap', symbol: 'G', help: '100 − latest score' },
  { key: 'difficulty', label: 'Difficulty', symbol: 'D', help: 'Level 1–5 mapped to 0–100' },
  { key: 'importance', label: 'Importance', symbol: 'I', help: 'Curriculum importance 0–100' },
  { key: 'revision', label: 'Revision need', symbol: 'R', help: 'Forgetting-curve decay since last practice' },
];

export const FACTOR_COLORS: Record<keyof PriorityWeights, string> = { gap: '#dc2626', difficulty: '#d97706', importance: '#3f45a8', revision: '#7c6be8' };

export function WeightsEditor({ weights, onChange }: { weights: PriorityWeights; onChange: (w: PriorityWeights) => void }) {
  const normalized = normalizeWeights(weights);
  const isDefault = FACTORS.every((f) => Math.abs(normalized[f.key] - DEFAULT_WEIGHTS[f.key]) < 1e-9);
  return (
    <div className="space-y-4">
      {FACTORS.map((f) => (
        <div key={f.key}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <label htmlFor={`w-${f.key}`} className="font-medium text-slate-700">
              <span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: FACTOR_COLORS[f.key] }} />
              {f.label} <span className="font-mono text-xs text-slate-400">({f.symbol})</span>
            </label>
            <span className="font-mono text-xs text-slate-600">
              w = {normalized[f.key].toFixed(2)}
            </span>
          </div>
          <input
            id={`w-${f.key}`}
            type="range"
            min={0}
            max={100}
            step={1}
            value={Math.round(weights[f.key] * 100)}
            onChange={(e) => onChange({ ...weights, [f.key]: Number(e.target.value) / 100 })}
            className="w-full accent-brand-700"
            aria-describedby={`w-${f.key}-help`}
          />
          <p id={`w-${f.key}-help`} className="text-xs text-slate-500">
            {f.help}
          </p>
        </div>
      ))}
      <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3">
        <p className="font-mono text-xs text-slate-700">
          P = {normalized.gap.toFixed(2)}G + {normalized.difficulty.toFixed(2)}D + {normalized.importance.toFixed(2)}I + {normalized.revision.toFixed(2)}R
        </p>
        <Button size="sm" variant="secondary" disabled={isDefault} onClick={() => onChange({ ...DEFAULT_WEIGHTS })}>
          Reset
        </Button>
      </div>
      <p className="text-xs text-slate-500">Weights are normalised to sum to 1, so P always stays on a 0–100 scale.</p>
    </div>
  );
}
