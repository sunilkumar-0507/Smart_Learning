import { NavLink } from 'react-router-dom';
import { NAV_GROUPS } from './navigation';
import { Logo } from './Logo';
import { useRanking, useLookups } from '@/hooks/useEngine';

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { recommendations } = useRanking();
  const { topicById } = useLookups();
  const next = recommendations[0];

  return (
    <div className="flex h-full flex-col bg-brand-900 text-brand-100">
      <div className="px-5 py-5">
        <Logo to="/dashboard" inverted />
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-4" aria-label="Main navigation">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-brand-300">{group.label}</p>
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        isActive ? 'bg-white/10 text-white' : 'text-brand-200 hover:bg-white/5 hover:text-white'
                      }`
                    }
                  >
                    <item.icon size={18} aria-hidden="true" />
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      {next && (
        <div className="m-3 rounded-xl bg-white/5 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-300">Up next</p>
          <p className="mt-1 text-sm font-medium text-white">{topicById.get(next.topicId)?.name}</p>
          <p className="mt-0.5 text-xs text-brand-200">
            {next.level} priority · {next.priority.toFixed(1)}
          </p>
          <NavLink to="/learning-path" onClick={onNavigate} className="mt-3 inline-block text-xs font-semibold text-accent-400 hover:text-white">
            Open learning path →
          </NavLink>
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
      <SidebarContent />
    </aside>
  );
}
