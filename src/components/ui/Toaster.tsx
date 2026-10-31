import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useToastStore } from '@/store/toastStore';

const icons = {
  success: <CheckCircle2 size={18} className="text-emerald-500" />,
  error: <XCircle size={18} className="text-red-500" />,
  info: <Info size={18} className="text-sky-500" />,
};

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-pop" role="status">
          {icons[t.tone]}
          <p className="flex-1 text-sm text-slate-700">{t.message}</p>
          <button type="button" className="text-slate-400 hover:text-slate-600" onClick={() => dismiss(t.id)} aria-label="Dismiss notification">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
