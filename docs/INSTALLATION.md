# Installation & Deployment

## Prerequisites
- **Node.js 18 or newer** (developed and tested with Node.js 24) and **npm**
- Git (optional)
- A modern browser

## Install and run locally
```bash
git clone <your-repository-url> smart-learning-path   # or copy the project folder
cd smart-learning-path
npm install
npm run dev
```
Open the printed URL (default `http://localhost:5173`).

## Scripts
| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server with hot reload |
| `npm run typecheck` | TypeScript strict type check |
| `npm run test` | Run all 88 automated tests once |
| `npm run test:watch` | Re-run tests on change |
| `npm run build` | Type-check, build to `dist/`, and create `dist/404.html` |
| `npm run preview` | Serve the production build at `http://localhost:4173` |
| `npm run experiments [seed]` | Run the simulated A/B/C evaluation in the terminal |

## Deploy (static hosting)
The output in `dist/` is plain static files. No server or environment variables are required.

### Netlify
1. New site → import the repository (or drag the `dist` folder onto Netlify Drop).
2. Build command `npm run build`, publish directory `dist`.
3. `public/_redirects` (copied into `dist/`) makes deep links such as `/dashboard` work.

### Vercel
1. Import the repository and choose the **Vite** preset.
2. Build command `npm run build`, output `dist`.
3. `vercel.json` rewrites all paths to `index.html`.

### GitHub Pages
1. Build with the repository sub-path: `VITE_BASE=/<repo-name>/ npm run build` (in PowerShell: `$env:VITE_BASE="/<repo-name>/"; npm run build`).
2. Publish the contents of `dist/` (for example to a `gh-pages` branch, or with a Pages workflow that uploads `dist`).
3. `dist/404.html` is a copy of `index.html`, so client-side routes resolve.

## Troubleshooting
- **Blank page on a sub-path:** rebuild with the correct `VITE_BASE`.
- **"Browser storage is not available":** private modes in some browsers block LocalStorage. Use a normal window.
- **Reset everything:** Settings → Delete all data, or clear site data in the browser.
