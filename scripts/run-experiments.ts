// Runs the simulated A/B/C comparison from the command line:
//   npm run experiments            (default seed and settings)
//   npm run experiments -- 12345   (custom seed)
// Results are SIMULATED and do not represent real student learning outcomes.

import { buildCurriculum, defaultSettings } from '../src/data/seed';
import { DEFAULT_EXPERIMENT_CONFIG, runExperiment, type CurriculumTopic } from '../src/lib/engine/experiments';

const seedArg = Number(process.argv[2]);
const config = { ...DEFAULT_EXPERIMENT_CONFIG, ...(Number.isInteger(seedArg) ? { seed: seedArg } : {}) };
const settings = defaultSettings();
const { subjects, topics } = buildCurriculum();
const index = new Map(subjects.map((s, i) => [s.id, i]));
const curriculum: CurriculumTopic[] = topics.map((t) => ({
  id: t.id,
  name: t.name,
  subjectId: t.subjectId,
  difficulty: t.difficulty,
  importance: t.importance,
  estimatedMinutes: t.estimatedMinutes,
  prerequisites: t.prerequisites,
  order: index.get(t.subjectId)! * 1000 + t.order,
}));

const result = runExperiment(curriculum, settings.engine, settings.thresholds, config);
const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

console.log(`SIMULATED evaluation — seed ${config.seed}, ${result.profileCount} profiles, ${result.topicCount} topics, top-K ${config.topK}`);
console.log(`Average truly weak incomplete topics per profile: ${result.averageWeakTopics.toFixed(2)}\n`);
console.log(['Method', 'WTIR', 'nDCG@K', 'PrereqCompliance', 'PathCompletion', 'Time(ms)'].join('\t'));
for (const m of result.methods) {
  console.log(
    [
      `${m.method} ${m.name}`,
      `${pct(m.mean.weakTopicIdentification)} ±${pct(m.sd.weakTopicIdentification)}`,
      `${pct(m.mean.relevance)} ±${pct(m.sd.relevance)}`,
      `${pct(m.mean.prerequisiteCompliance)} ±${pct(m.sd.prerequisiteCompliance)}`,
      `${pct(m.mean.pathCompletion)} ±${pct(m.sd.pathCompletion)}`,
      m.mean.generationTimeMs.toFixed(3),
    ].join('\t'),
  );
}
