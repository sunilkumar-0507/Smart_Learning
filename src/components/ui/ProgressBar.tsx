interface ProgressBarProps {
  value: number;
  max?: number;
  tone?: 'brand' | 'success' | 'warning' | 'danger';
  label?: string;
  size?: 'sm' | 'md';
}

const tones = { brand: 'bg-brand-600', success: 'bg-emerald-500', warning: 'bg-amber-500', danger: 'bg-red-500' };

export function ProgressBar({ value, max = 100, tone = 'brand', label, size = 'md' }: ProgressBarProps) {
  const pct = max <= 0 ? 0 : Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={`w-full overflow-hidden rounded-full bg-slate-100 ${size === 'sm' ? 'h-1.5' : 'h-2.5'}`}
    >
      <div className={`h-full rounded-full transition-all duration-500 ${tones[tone]}`} style={{ width: `${pct}%` }} />
    </div>
  );
}
