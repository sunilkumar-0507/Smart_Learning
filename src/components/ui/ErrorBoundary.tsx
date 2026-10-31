import { Component, type ErrorInfo, type ReactNode } from 'react';

interface State {
  error: Error | null;
}

/** Catches rendering errors so a single faulty view never blanks the whole app. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled UI error', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface p-6">
        <div className="card max-w-md p-6 text-center">
          <h1 className="text-lg font-semibold text-slate-900">Something went wrong</h1>
          <p className="mt-2 text-sm text-slate-600">{this.state.error.message}</p>
          <p className="mt-2 text-xs text-slate-500">Your data is stored locally and has not been deleted.</p>
          <div className="mt-5 flex justify-center gap-2">
            <button type="button" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" onClick={() => this.setState({ error: null })}>
              Try again
            </button>
            <a href={`${import.meta.env.BASE_URL}dashboard`}className="rounded-lg bg-brand-700 px-3 py-2 text-sm font-medium text-white">
              Go to dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }
}
