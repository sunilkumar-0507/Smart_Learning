# Smart Learning Path Recommendation System

> **Research title:** *An Adaptive Learning Path Recommendation Framework Using Performance-Based Weighted Priority Scheduling*

A frontend-only web application. It analyses a student's assessment performance, finds knowledge gaps, scores every topic's priority with the **PBWPS** algorithm and builds a personalised, prerequisite-aware learning path and study timetable. All logic runs in the browser and all data is kept in LocalStorage. There is no backend, no external API and no sign-up.

## Features

| Module | What it does |
| --- | --- |
| Landing page | Explains the project and the algorithm. Offers "Get started" (new profile) or "Explore demo student". |
| Student profile | Name, email, interests, education level, daily study time and goals. Stored locally and editable. |
| Dashboard | Live counts of subjects, topics, completed and pending topics, overall score, streak and study time. Also shows the next recommendation, a weekly activity chart, subject progress and recent assessments. |
| Subject management | Create, edit and delete subjects, topics (difficulty, importance, time, prerequisites) and questions. Prerequisite choices that would create a cycle are blocked. |
| Assessment engine | Multiple-choice questions with 4 options each. You cannot submit until every question is answered. Scores, explanations, history, and the topic's priority before and after. |
| Performance analysis | Topic and subject scores, strong and weak topics, trend line, band distribution and improvement %. Thresholds are configurable. |
| Recommendation engine | PBWPS ranking with factor breakdown, an explanation for each topic, a list of locked topics, live weight sliders, and a per-student A/B/C comparison. |
| Learning path | Roadmap built by a priority-driven topological sort. You can start, complete and review topics. |
| Resources | Each topic has 5 resource types (explanation, code, exercise, notes, quiz). You can mark resources complete and add your own. |
| Study schedule | Deterministic timetable from your daily hours, study days and exam date. Detects conflicts, reschedules missed sessions and tracks completed ones. |
| Progress tracking | Daily and weekly charts, topic improvement, subject completion and an activity log. |
| Experiments | Reproducible comparison of Methods A, B and C on 100–1000 **simulated** profiles, using 5 metrics. |
| Settings | Profile, engine parameters, weights and thresholds. JSON backup and restore, CSV export, reset to demo data, and delete all data with confirmation. |

## Sample data

- 5 subjects (Web Development, Programming Fundamentals, Database Management, Data Structures, Computer Networks)
- 50 topics with prerequisite links within and across subjects
- 250 multiple-choice questions, each with an explanation
- 250 learning resources (5 per topic)
- A demo student with assessment history, completed topics and activity

## The PBWPS algorithm

```
P = 0.40·G + 0.25·D + 0.20·I + 0.15·R        (weights configurable, normalised to Σw = 1)

G  knowledge gap           = 100 − latest score   (assumed default when never assessed)
D  normalised difficulty   = (level − 1) / 4 × 100
I  topic importance        ∈ [0, 100]
R  revision requirement    = 100 · (1 − e^(−Δt / S)),  S = S₀ · (0.5 + score/100)
```

Ranking is lexicographic: unlocked topics first, then incomplete weak topics, then higher P, higher importance, shorter time, curriculum order and id. Locked topics (prerequisites below the mastery score and not completed) are never recommended ahead of unlocked ones. The learning path uses Kahn's topological sort, picking the highest-ranked available topic at each step. Tarjan's SCC algorithm detects circular prerequisites.

All algorithms live in `src/lib/engine/` as pure TypeScript with no React dependency.

## Quick start

Requires **Node.js 18+** (tested with Node 24) and npm.

```bash
npm install
npm run dev          # http://localhost:5173
npm run test         # 88 automated tests (Vitest + React Testing Library)
npm run build        # type-check + production build into dist/
npm run preview      # serve the production build locally
npm run experiments  # run the simulated A/B/C evaluation in the terminal
```

## Deployment

`dist/` is a static site.

- **Netlify:** build command `npm run build`, publish directory `dist`. `public/_redirects` already handles client-side routes.
- **Vercel:** framework preset "Vite". `vercel.json` already rewrites routes to `index.html`.
- **GitHub Pages:** build with `VITE_BASE=/<repo-name>/ npm run build` and publish `dist/`. The build also writes `dist/404.html` so deep links work.

## Project structure

```
src/
  types/            Domain interfaces (StudentProfile, Topic, Recommendation, …)
  data/             Sample curriculum (5 subjects × 10 topics × 5 questions) and demo generator
  lib/engine/       PBWPS, graph algorithms, baselines, experiments, scheduler, analytics
  lib/storage/      Versioned LocalStorage, migration, validation, JSON/CSV import-export
  store/            Zustand store (single source of truth, auto-persisted)
  hooks/            Memoised selectors that connect the engine to React
  components/       UI design system, layout and domain components
  pages/            One component per route
  test/             Test setup and UI integration tests
docs/               Project report, IEEE paper draft, manuals and guides
scripts/            Experiment runner, GitHub Pages 404 helper
```

## Documentation

See [`docs/`](docs/README.md): full project report (28 sections), IEEE paper draft, presentation outline, demonstration guide, installation guide and user manual.

## Research integrity

The experiment module evaluates **simulated** students generated from a fixed random seed. Its results describe algorithm behaviour on synthetic data. They are **not** evidence of real learning gains, which still need a study with real students.
