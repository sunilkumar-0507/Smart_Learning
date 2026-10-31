# An Adaptive Learning Path Recommendation Framework Using Performance-Based Weighted Priority Scheduling

*IEEE conference paper draft. Author names, affiliations and the venue are to be added. This is a draft, not a submitted or accepted paper.*

---

**Abstract** — Self-directed learners must decide which topics to study next, under limited time and with incomplete knowledge of their own weaknesses. We propose Performance-Based Weighted Priority Scheduling (PBWPS), a deterministic and explainable framework for recommending learning paths. PBWPS scores each topic by a weighted combination of four normalised factors: knowledge gap from assessment results, topic difficulty, curriculum importance, and an exponential forgetting-curve revision requirement. It enforces prerequisite constraints through mastery-based locking and generates a complete learning sequence with a priority-driven topological sort. Every recommendation is accompanied by a factor-level explanation. We implement PBWPS in a fully client-side web application and evaluate it against an equal-priority baseline and a gap-only baseline on 120 reproducible simulated learners over a 50-topic computing curriculum. On this synthetic data, PBWPS achieves the highest recommendation relevance (nDCG@5 of 0.732 vs. 0.622 and 0.526) and complete prerequisite compliance (1.00 vs. 0.515 for the gap-only baseline). It identifies fewer weak topics in its top five than the gap-only method (0.310 vs. 0.426), because it postpones weak topics whose prerequisites are unmastered. These results are simulation-based; validation with real learners is future work.

**Index Terms** — adaptive learning, learning path recommendation, prerequisite graphs, topological sorting, explainable recommendation, spaced repetition.

## I. Introduction

Adaptive learning systems aim to tailor instruction to the individual learner [1], [2]. A central sub-problem is *sequencing*: choosing the next topic so that study time goes where it is most needed, while respecting the order in which concepts build on each other. Simple strategies are common in practice, such as following the syllabus or revising the lowest-scoring topics. They respectively ignore individual performance or curriculum structure.

This paper makes three contributions:
1. **PBWPS**, a weighted priority model that unifies new-learning need (knowledge gap), intrinsic topic properties (difficulty, importance) and retention need (revision requirement) on a common 0–100 scale with configurable weights.
2. **Prerequisite-constrained scheduling**, which combines mastery-based locking with a priority-driven topological sort and cycle detection, producing feasible, explainable learning sequences.
3. **A reproducible evaluation harness** with five metrics, comparing PBWPS with two baselines on seeded simulated learners. It is released as part of an open, fully client-side application.

## II. Related Work

Adaptive hypermedia research established curriculum sequencing and adaptive navigation support as core techniques [1]. Recommender systems for technology-enhanced learning adapt collaborative and content-based methods to educational settings [2]. Knowledge tracing models estimate latent mastery from response sequences [3]. Research on memory and distributed practice shows the benefit of spacing study over time [4]–[6]. Topological ordering of dependency graphs is classical [7], as is strongly connected component detection for finding cycles [8]. PBWPS draws on these strands but deliberately uses a transparent weighted score rather than a learned model, so that every decision can be explained to the learner.

## III. Proposed Method

### A. Notation and factors
For each topic *t*, let *s(t)* be the latest assessment score (or ⊥ if none), *ℓ(t)* ∈ {1..5} the difficulty, *imp(t)* ∈ [0, 100] the importance, and *Δt(t)* the days since last practice.

- Knowledge gap: *G = 100 − s* (or an assumed *G₀* when *s* = ⊥).
- Normalised difficulty: *D = 25(ℓ − 1)*.
- Importance: *I = imp*.
- Revision requirement: *R = 100(1 − e^{−Δt/S})*, *S = S₀(0.5 + s/100)*.

### B. Priority
With non-negative weights normalised to sum to one,
*P = ŵ_G G + ŵ_D D + ŵ_I I + ŵ_R R*,
using default weights (0.40, 0.25, 0.20, 0.15). Levels: Critical (≥ 80), High (≥ 60), Medium (≥ 40), Low.

### C. Prerequisite validation
A topic is *mastered* if it is completed or *s* ≥ θ (θ = 60). A learning candidate is *locked* if any existing prerequisite is not mastered. Cycles are detected with Tarjan's algorithm [8] and reported to the user.

### D. Ranking
Candidates are incomplete topics, plus completed topics whose *R* or low score calls for review. They are sorted by the lexicographic key (locked, ¬weak-and-incomplete, −P, −I, time, curriculum order, id). This total order guarantees deterministic tie-breaking.

### E. Learning path generation
Over incomplete topics, with edges only to unmastered prerequisites, Kahn's algorithm [7] repeatedly emits the best-ranked topic with in-degree zero. The resulting sequence respects all prerequisites while preferring high-priority work. Topics on cycles are appended and flagged.

### F. Explanation
For each topic the system reports the measured or assumed gap, the weak-topic status, notable difficulty, importance and revision need, the factor with the largest weighted contribution, the prerequisite status, and the number of topics it unlocks.

## IV. System Implementation

The framework is implemented as a single-page application (React 18, TypeScript, Vite) whose algorithms are pure TypeScript modules independent of the UI. A Zustand store holds all state, which is persisted to browser LocalStorage with schema versioning, migration and validation. The application includes topic assessments (250 questions over 50 topics), performance analytics, a learning-path roadmap, resources, a deterministic scheduler that packs the path into study days before an exam date, and an in-browser experiment runner. No server or external API is used.

## V. Experimental Setup

**Simulated learners.** 120 profiles (seed 20251101). Latent ability is drawn from N(60, 16²). True mastery depends on ability, difficulty and prerequisite mastery. 30–80% of topics are observed through a noisy 5-item assessment (20-point steps). Completion is consistent with prerequisites.

**Baselines.** (A) equal priority over eligible topics in curriculum order; (B) incomplete topics ranked by knowledge gap without prerequisite checks.

**Metrics** (K = 5; weak ⇔ true mastery < 40). Weak Topic Identification Rate (recall@K normalised by min(K, |weak|)); nDCG@K [9] with true gap as relevance; prerequisite compliance of the top-K; path completion rate of a learner following the full sequence under a 600-minute budget; generation time.

## VI. Results

**TABLE I. Simulated evaluation (mean ± SD over 120 profiles, seed 20251101).** *Simulated data — not real learning outcomes.*

| Method | WTIR | nDCG@5 | Compliance | Path completion | Time (ms) |
| --- | --- | --- | --- | --- | --- |
| A | 0.167 ± 0.289 | 0.526 ± 0.170 | 1.000 | 1.000 | 0.17 |
| B | **0.426** ± 0.408 | 0.622 ± 0.228 | 0.515 ± 0.258 | 0.888 ± 0.211 | **0.04** |
| C (PBWPS) | 0.310 ± 0.346 | **0.732** ± 0.113 | **1.000** | **1.000** | 0.65 |

A second seed (777) produced the same ordering (nDCG: 0.520 / 0.639 / 0.752; compliance: 1.000 / 0.563 / 1.000).

## VII. Discussion

PBWPS improved relevance while guaranteeing feasibility. The gap-only baseline found more weak topics, but half of its recommendations were not yet studiable, which reduced simulated path completion. This reveals a design trade-off between surfacing weaknesses immediately and sequencing them after their foundations. Because PBWPS weights and the mastery threshold are configurable, practitioners can move along this trade-off. **Threats to validity:** the simulator embodies our modelling assumptions; compliance is enforced by construction for A and C; timing is hardware-dependent; and no real learners were involved.

## VIII. Conclusion and Future Work

We presented PBWPS, an explainable, prerequisite-aware learning path recommender, and a reproducible, client-side evaluation harness. Simulated results indicate higher relevance and full feasibility compared with simple baselines. Future work includes a controlled study with students to measure learning gains **[Requires real-student validation]**, learning weights from outcome data, integrating knowledge tracing [3], and spacing-aware scheduling [5], [6].

## References

*Verify bibliographic details against the original sources before submission.*

[1] P. Brusilovsky, "Adaptive hypermedia," *User Model. User-Adapt. Interact.*, vol. 11, no. 1–2, pp. 87–110, 2001.
[2] N. Manouselis, H. Drachsler, R. Vuorikari, H. Hummel, and R. Koper, "Recommender systems in technology enhanced learning," in *Recommender Systems Handbook*. Boston, MA, USA: Springer, 2011, pp. 387–415.
[3] A. T. Corbett and J. R. Anderson, "Knowledge tracing: Modeling the acquisition of procedural knowledge," *User Model. User-Adapt. Interact.*, vol. 4, no. 4, pp. 253–278, 1994.
[4] H. Ebbinghaus, *Memory: A Contribution to Experimental Psychology*. New York, NY, USA: Teachers College, Columbia Univ., 1913 (orig. 1885).
[5] N. J. Cepeda, H. Pashler, E. Vul, J. T. Wixted, and D. Rohrer, "Distributed practice in verbal recall tasks: A review and quantitative synthesis," *Psychol. Bull.*, vol. 132, no. 3, pp. 354–380, 2006.
[6] J. Dunlosky, K. A. Rawson, E. J. Marsh, M. J. Nathan, and D. T. Willingham, "Improving students' learning with effective learning techniques," *Psychol. Sci. Public Interest*, vol. 14, no. 1, pp. 4–58, 2013.
[7] A. B. Kahn, "Topological sorting of large networks," *Commun. ACM*, vol. 5, no. 11, pp. 558–562, 1962.
[8] R. Tarjan, "Depth-first search and linear graph algorithms," *SIAM J. Comput.*, vol. 1, no. 2, pp. 146–160, 1972.
[9] K. Järvelin and J. Kekäläinen, "Cumulated gain-based evaluation of IR techniques," *ACM Trans. Inf. Syst.*, vol. 20, no. 4, pp. 422–446, 2002.
