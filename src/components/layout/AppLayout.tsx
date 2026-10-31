import { useEffect, useState } from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AlertTriangle, Flame, Menu, X } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { useProgressSummary } from '@/hooks/useEngine';
import { Sidebar, SidebarContent } from './Sidebar';
import { titleForPath } from './navigation';

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('');
}

/** Local-demo route protection: the app requires a student profile. */
export function RequireProfile() {
  const profile = useAppStore((s) => s.profile);
  const location = useLocation();
  if (!profile) return <Navigate to="/" replace state={{ from: location.pathname }} />;
  return <AppLayout />;
}

function AppLayout() {
  const profile = useAppStore((s) => s.profile)!;
  const storageError = useAppStore((s) => s.storageError);
  const dismissStorageError = useAppStore((s) => s.dismissStorageError);
  const { streak } = useProgressSummary();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const title = titleForPath(location.pathname);

  useEffect(() => {
    document.title = `${title} · Smart Learning Path`;
    window.scrollTo(0, 0);
  }, [title, location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <div className="min-h-screen">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2">
        Skip to content
      </a>
      <Sidebar />

      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div className="absolute inset-0 bg-brand-950/50" onClick={() => setMenuOpen(false)} aria-hidden="true" />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] shadow-pop">
            <button
              type="button"
              className="absolute right-3 top-5 z-10 rounded-md p-1 text-brand-200 hover:text-white"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
            <SidebarContent onNavigate={() => setMenuOpen(false)} />
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button type="button" className="rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu">
              <Menu size={20} />
            </button>
            <p className="flex-1 truncate text-sm font-semibold text-slate-900">{title}</p>
            <div className="hidden items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 sm:flex" title="Current learning streak">
              <Flame size={14} /> {streak}-day streak
            </div>
            <Link to="/settings" className="flex items-center gap-2 rounded-full p-1 pr-3 hover:bg-slate-100" aria-label="Open profile settings">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-700 text-xs font-semibold text-white">{initials(profile.name) || '?'}</span>
              <span className="hidden text-sm font-medium text-slate-700 md:block">{profile.name}</span>
            </Link>
          </div>
        </header>

        {storageError && (
          <div className="flex items-start gap-3 border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 sm:px-6 lg:px-8" role="alert">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <p className="flex-1">{storageError}</p>
            <button type="button" className="font-medium underline" onClick={dismissStorageError}>
              Dismiss
            </button>
          </div>
        )}

        <main id="main" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
