// Shared chart styling so every Recharts view reads as one system.

import type { ReactElement } from 'react';
import { ResponsiveContainer } from 'recharts';

export const CHART_COLORS = {
  primary: '#3f45a8',
  accent: '#7c6be8',
  success: '#059669',
  warning: '#d97706',
  danger: '#dc2626',
  info: '#0284c7',
  muted: '#cbd5e1',
  grid: '#eef0f4',
};

export const axisProps = { tickLine: false, axisLine: false, tick: { fontSize: 12, fill: '#64748b' } } as const;

export const tooltipProps = {
  contentStyle: { borderRadius: 10, border: '1px solid #e2e8f0', boxShadow: '0 8px 24px -8px rgba(19,21,58,.2)', fontSize: 12 },
  cursor: { fill: 'rgba(79,88,194,0.06)' },
} as const;

export function ChartFrame({ height = 260, children, label }: { height?: number; children: ReactElement; label: string }) {
  return (
    <div style={{ height }} role="img" aria-label={label} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}
