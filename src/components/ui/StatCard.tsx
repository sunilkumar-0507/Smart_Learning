import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon: ReactNode;
  tone?: 'brand' | 'success' | 'warning' | 'danger' | 'violet' | 'info';
}

const tones = {
  brand: 'bg-brand-50 text-brand-700',
  success: 'bg-emerald-50 text-emerald-600',
  warning: 'bg-amber-50 text-amber-600',
  danger: 'bg-red-50 text-red-600',
  violet: 'bg-accent-50 text-accent-600',
  info: 'bg-sky-50 text-sky-600',
};

export function StatCard({ label, value, hint, icon, tone = 'brand' }: StatCardProps) {
  return (
    <div className="card flex items-start gap-4 p-4">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
        {hint && <p className="mt-0.5 truncate text-xs text-slate-500">{hint}</p>}
      </div>
    </div>
  );
}
