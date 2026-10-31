/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef0fb',
          100: '#dde1f7',
          200: '#bcc3ef',
          300: '#939ee3',
          400: '#6b77d4',
          500: '#4f58c2',
          600: '#3f45a8',
          700: '#343988',
          800: '#2a2e6b',
          900: '#1e2150',
          950: '#13153a',
        },
        accent: {
          50: '#f3f1fe',
          100: '#e8e4fd',
          400: '#9b8cf3',
          500: '#7c6be8',
          600: '#6650d6',
        },
        surface: '#f5f6fa',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.06)',
        pop: '0 12px 32px -8px rgba(19,21,58,0.25)',
      },
    },
  },
  plugins: [],
};
