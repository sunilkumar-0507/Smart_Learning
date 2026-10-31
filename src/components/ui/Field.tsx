import type { ReactNode } from 'react';

interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string | null;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Label + control + validation message wrapper used by every form. */
export function Field({ label, htmlFor, error, hint, children, className = '' }: FieldProps) {
  return (
    <div className={className}>
      <label className="label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>
      )}
    </div>
  );
}
