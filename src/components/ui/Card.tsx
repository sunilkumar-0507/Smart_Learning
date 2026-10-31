import type { ReactNode } from 'react';

interface CardProps {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function Card({ title, description, actions, children, className = '', bodyClassName = 'p-5' }: CardProps) {
  return (
    <section className={`card ${className}`}>
      {(title || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="min-w-0">
            {title && <h2 className="text-sm font-semibold text-slate-900">{title}</h2>}
            {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}
