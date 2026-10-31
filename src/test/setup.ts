import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// jsdom lacks ResizeObserver, which Recharts' ResponsiveContainer relies on.
if (!('ResizeObserver' in globalThis)) {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  (globalThis as unknown as { ResizeObserver: typeof ResizeObserverStub }).ResizeObserver = ResizeObserverStub;
}
window.scrollTo = () => {};

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});
