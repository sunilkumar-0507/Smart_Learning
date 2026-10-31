import { Link } from 'react-router-dom';

export function Logo({ to = '/', inverted = false }: { to?: string; inverted?: boolean }) {
  return (
    <Link to={to} className="flex items-center gap-2.5" aria-label="Smart Learning Path home">
      <svg viewBox="0 0 32 32" className="h-8 w-8 shrink-0" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill={inverted ? '#ffffff' : '#1e2150'} />
        <path d="M8 21l6-6 4 4 6-8" stroke="#9b8cf3" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="24" cy="11" r="2.5" fill={inverted ? '#1e2150' : '#ffffff'} />
      </svg>
      <span className={`text-sm font-semibold leading-tight ${inverted ? 'text-white' : 'text-slate-900'}`}>
        Smart Learning
        <span className={`block text-xs font-normal ${inverted ? 'text-brand-200' : 'text-slate-500'}`}>Path Recommender</span>
      </span>
    </Link>
  );
}
