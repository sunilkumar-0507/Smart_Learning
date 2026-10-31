import { Compass } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { useAppStore } from '@/store/appStore';

export function NotFoundPage() {
  const hasProfile = useAppStore((s) => s.profile !== null);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-6 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-700">
        <Compass size={26} />
      </div>
      <h1 className="text-2xl font-semibold text-slate-900">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500">The page you are looking for does not exist or has moved.</p>
      <ButtonLink to={hasProfile ? '/dashboard' : '/'} className="mt-6">
        {hasProfile ? 'Back to dashboard' : 'Back to home'}
      </ButtonLink>
    </div>
  );
}
