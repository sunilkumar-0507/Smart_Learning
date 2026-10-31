# Project Presentation Outline (15–20 minutes)

| # | Slide | Key content | Time |
| --- | --- | --- | --- |
| 1 | Title | Project name, research title, team, guide, institution | 0:30 |
| 2 | The problem | Students do not know what to study next; syllabus order ignores weaknesses; lowest-score-first ignores prerequisites | 1:30 |
| 3 | Existing approaches and limitations | A table of syllabus order, self-assessment, fixed platforms, score lists and server-based adaptive systems | 1:30 |
| 4 | Objectives | Explainable priority, prerequisite safety, full working app, local-first, reproducible evaluation | 1:00 |
| 5 | Proposed system | Architecture diagram: UI → Zustand store → pure engine → versioned LocalStorage | 1:30 |
| 6 | PBWPS formula | P = 0.40G + 0.25D + 0.20I + 0.15R; definition of each factor; weight normalisation | 2:00 |
| 7 | Prerequisite-aware scheduling | Mastery locking, Tarjan cycle detection, Kahn priority topological sort (small worked example graph) | 1:30 |
| 8 | Explainability | Screenshot of a recommendation with its factor bar and "why" list | 1:00 |
| 9 | Live demo | Follow `DEMO_GUIDE.md` | 5:00 |
| 10 | Experimental setup | 120 simulated profiles, seed, three methods, five metrics — labelled **SIMULATED** | 1:00 |
| 11 | Results | Table + bar chart: C best nDCG (73.2%) and 100% compliance; B higher WTIR (42.6% vs 31.0%) — discuss the trade-off honestly | 1:30 |
| 12 | Testing | 88 automated tests across 7 suites, strict TypeScript, production build | 0:45 |
| 13 | Limitations and future work | Simulation only; coarse assessments; fixed weights → real-student study, learned weights, knowledge tracing | 1:00 |
| 14 | Conclusion | Working, deployable, explainable recommender; research claims pending validation | 0:30 |
| 15 | Q&A | — | — |

**Speaker notes**

- Always say "simulated" when presenting numbers from slide 11.
- If asked "why not machine learning?": transparency, no data requirement, runs offline. ML is listed as future work.
- If asked "why does B find more weak topics?": B ignores prerequisites, so half of its picks are not yet studiable (compliance 51.5%).
