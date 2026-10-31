// Builds default application data and the reproducible demo dataset.

import type {
  AppData,
  AppSettings,
  AssessmentResult,
  LearningActivity,
  LearningResource,
  Question,
  StudentProfile,
  Subject,
  Topic,
  TopicProgress,
} from '@/types';
import { createRng, randInt, shuffle } from '@/lib/random';
import { addDays, toISODate } from '@/lib/date';
import { DEFAULT_WEIGHTS } from '@/lib/engine/pbwps';
import { DEFAULT_THRESHOLDS } from '@/lib/engine/performance';
import { calculateScore } from '@/lib/engine/assessment';
import type { SubjectSeed, TopicSeed } from './curriculum/types';
import { webDevelopment } from './curriculum/webDevelopment';
import { programmingFundamentals } from './curriculum/programmingFundamentals';
import { databaseManagement } from './curriculum/databaseManagement';
import { dataStructures } from './curriculum/dataStructures';
import { computerNetworks } from './curriculum/computerNetworks';

export const STORAGE_VERSION = 2;

export const CURRICULUM: SubjectSeed[] = [webDevelopment, programmingFundamentals, databaseManagement, dataStructures, computerNetworks];

const SEED_CREATED_AT = '2025-01-01T00:00:00.000Z';

export function defaultSettings(): AppSettings {
  return {
    engine: {
      weights: { ...DEFAULT_WEIGHTS },
      defaultUnassessedGap: 60,
      prerequisiteMastery: 60,
      revisionStabilityDays: 14,
      reviewThreshold: 60,
    },
    thresholds: { ...DEFAULT_THRESHOLDS },
    schedule: { dailyHours: 2, studyDays: [1, 2, 3, 4, 5, 6], examDate: '', maxSessionMinutes: 60 },
  };
}

function buildQuestions(topic: TopicSeed): Question[] {
  return topic.questions.map(([text, options, correctIndex, explanation], i) => ({
    id: `${topic.id}-q${i + 1}`,
    topicId: topic.id,
    text,
    options,
    correctIndex,
    explanation,
  }));
}

export function buildResources(topic: TopicSeed): LearningResource[] {
  return [
    { id: `${topic.id}-r-text`, topicId: topic.id, type: 'text', title: `${topic.name}: Concept Explanation`, content: topic.explanation, estimatedMinutes: 10 },
    { id: `${topic.id}-r-code`, topicId: topic.id, type: 'code', title: `${topic.name}: Worked Example`, content: topic.code.snippet, language: topic.code.language, estimatedMinutes: 15 },
    { id: `${topic.id}-r-exercise`, topicId: topic.id, type: 'exercise', title: `${topic.name}: Practice Exercise`, content: topic.exercise, estimatedMinutes: Math.max(15, Math.round(topic.minutes / 3)) },
    { id: `${topic.id}-r-notes`, topicId: topic.id, type: 'notes', title: `${topic.name}: Revision Notes`, content: topic.notes.map((n) => `• ${n}`).join('\n'), estimatedMinutes: 5 },
    {
      id: `${topic.id}-r-quiz`,
      topicId: topic.id,
      type: 'quiz',
      title: `${topic.name}: Self-check Quiz Material`,
      content: [
        'Answer these questions in your own words before taking the graded assessment:',
        ...topic.questions.map(([q], i) => `${i + 1}. ${q}`),
      ].join('\n'),
      estimatedMinutes: 10,
    },
  ];
}

export interface Curriculum {
  subjects: Subject[];
  topics: Topic[];
  resources: LearningResource[];
}

export function buildCurriculum(): Curriculum {
  const subjects: Subject[] = [];
  const topics: Topic[] = [];
  const resources: LearningResource[] = [];
  for (const s of CURRICULUM) {
    subjects.push({ id: s.id, name: s.name, description: s.description, color: s.color, createdAt: SEED_CREATED_AT });
    s.topics.forEach((t, index) => {
      topics.push({
        id: t.id,
        subjectId: s.id,
        name: t.name,
        description: t.description,
        difficulty: t.difficulty,
        importance: t.importance,
        estimatedMinutes: t.minutes,
        prerequisites: [...t.prerequisites],
        questions: buildQuestions(t),
        order: index,
      });
      resources.push(...buildResources(t));
    });
  }
  return { subjects, topics, resources };
}

/** Fresh workspace for a new student: full curriculum, no history. */
export function createEmptyData(profile: StudentProfile | null = null): AppData {
  return {
    version: STORAGE_VERSION,
    profile,
    ...buildCurriculum(),
    results: [],
    progress: {},
    completedResourceIds: [],
    activities: [],
    schedule: null,
    settings: defaultSettings(),
  };
}

export const DEMO_PROFILE: Omit<StudentProfile, 'createdAt'> = {
  id: 'student-demo',
  name: 'Aarav Sharma',
  email: 'aarav.sharma@student.example.edu',
  interests: ['Web Development', 'Databases', 'Algorithms'],
  educationLevel: 'Undergraduate',
  dailyStudyMinutes: 120,
  learningGoals: 'Become a full-stack developer and prepare for the end-semester examinations in data structures and networking.',
};

/**
 * Deterministic demo history: the same seed always yields the same attempts,
 * expressed relative to `now` so that streaks and schedules look current.
 */
export function createDemoData(now: Date = new Date()): AppData {
  const data = createEmptyData({ ...DEMO_PROFILE, createdAt: new Date(now.getTime() - 35 * 86_400_000).toISOString() });
  const rng = createRng(4242);
  const topicById = new Map(data.topics.map((t) => [t.id, t]));
  const at = (daysAgo: number, hour: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    d.setHours(hour, randInt(rng, 0, 59), 0, 0);
    return d;
  };

  // [topicId, days ago, number of correct answers out of 5]
  const attempts: [string, number, number][] = [
    ['web-html', 30, 3], ['web-html', 21, 5],
    ['web-css', 28, 2], ['web-css', 12, 4],
    ['web-js-variables', 26, 4],
    ['web-js-functions', 20, 2], ['web-js-functions', 6, 3],
    ['web-arrays', 18, 4],
    ['web-objects', 15, 1],
    ['pf-algorithms', 29, 4],
    ['pf-datatypes', 27, 5],
    ['pf-operators', 25, 4],
    ['pf-conditionals', 23, 3], ['pf-conditionals', 9, 5],
    ['pf-loops', 19, 3],
    ['pf-functions', 11, 2],
    ['pf-recursion', 4, 1],
    ['db-concepts', 24, 5],
    ['db-relational', 17, 3],
    ['db-sql', 14, 4],
    ['db-filtering', 8, 2],
    ['ds-complexity', 13, 2], ['ds-complexity', 3, 3],
    ['ds-arrays', 7, 3],
    ['cn-fundamentals', 22, 4],
    ['cn-osi', 10, 2],
    ['cn-tcpip', 2, 3],
    ['web-dom', 1, 2],
  ];

  const results: AssessmentResult[] = [];
  const activities: LearningActivity[] = [];
  for (const [topicId, daysAgo, correct] of attempts) {
    const topic = topicById.get(topicId)!;
    // Choose which questions were answered correctly, reproducibly.
    const order = shuffle(rng, topic.questions.map((q) => q.id));
    const correctIds = new Set(order.slice(0, correct));
    const answers: Record<string, number> = {};
    for (const q of topic.questions) answers[q.id] = correctIds.has(q.id) ? q.correctIndex : (q.correctIndex + 1 + randInt(rng, 0, 2)) % 4;
    const scored = calculateScore(topic.questions, answers);
    const completedAt = at(daysAgo, randInt(rng, 9, 20));
    const duration = randInt(rng, 180, 600);
    results.push({
      id: `res-demo-${results.length + 1}`,
      topicId,
      subjectId: topic.subjectId,
      ...scored,
      startedAt: new Date(completedAt.getTime() - duration * 1000).toISOString(),
      completedAt: completedAt.toISOString(),
      durationSeconds: duration,
    });
    activities.push({
      id: `act-demo-a${results.length}`,
      type: 'assessment',
      topicId,
      minutes: Math.round(duration / 60),
      timestamp: completedAt.toISOString(),
      description: `Completed ${topic.name} assessment (${scored.score}%)`,
    });
  }

  // Topics the demo student has finished studying, and when.
  const completed: [string, number][] = [
    ['web-html', 21], ['web-css', 12], ['web-js-variables', 25], ['web-arrays', 17],
    ['pf-algorithms', 28], ['pf-datatypes', 26], ['pf-operators', 24], ['pf-conditionals', 9],
    ['db-concepts', 23], ['db-sql', 13], ['cn-fundamentals', 21],
  ];
  const inProgress: [string, number][] = [['web-js-functions', 6], ['pf-loops', 5], ['db-relational', 16], ['ds-complexity', 3], ['web-objects', 2]];
  const progress: Record<string, TopicProgress> = {};
  for (const [topicId, daysAgo] of completed) {
    const topic = topicById.get(topicId)!;
    const startedAt = at(daysAgo + 2, 18).toISOString();
    const completedAt = at(daysAgo, 19).toISOString();
    progress[topicId] = { topicId, status: 'completed', startedAt, completedAt };
    activities.push(
      { id: `act-demo-s-${topicId}`, type: 'topic-started', topicId, minutes: 0, timestamp: startedAt, description: `Started ${topic.name}` },
      { id: `act-demo-c-${topicId}`, type: 'topic-completed', topicId, minutes: topic.estimatedMinutes, timestamp: completedAt, description: `Completed ${topic.name}` },
    );
  }
  for (const [topicId, daysAgo] of inProgress) {
    const topic = topicById.get(topicId)!;
    const startedAt = at(daysAgo, 17).toISOString();
    progress[topicId] = { topicId, status: 'in-progress', startedAt };
    activities.push({ id: `act-demo-s-${topicId}`, type: 'topic-started', topicId, minutes: 0, timestamp: startedAt, description: `Started ${topic.name}` });
  }

  // Resources read, plus short daily study sessions to give a realistic streak.
  const completedResourceIds: string[] = [];
  for (const [topicId] of completed) {
    completedResourceIds.push(`${topicId}-r-text`, `${topicId}-r-notes`);
    if (rng() > 0.4) completedResourceIds.push(`${topicId}-r-code`);
  }
  completedResourceIds.push('web-js-functions-r-text', 'ds-complexity-r-text', 'pf-loops-r-text');
  completedResourceIds.forEach((id, i) => {
    const res = data.resources.find((r) => r.id === id)!;
    activities.push({
      id: `act-demo-r${i}`,
      type: 'resource-completed',
      topicId: res.topicId,
      minutes: res.estimatedMinutes,
      timestamp: at(randInt(rng, 1, 30), 16).toISOString(),
      description: `Finished resource "${res.title}"`,
    });
  });
  const studyTopics = ['web-js-functions', 'pf-loops', 'ds-complexity', 'db-relational', 'web-objects'];
  for (let daysAgo = 0; daysAgo < 9; daysAgo += 1) {
    const topicId = studyTopics[daysAgo % studyTopics.length];
    const minutes = randInt(rng, 30, 75);
    activities.push({
      id: `act-demo-st${daysAgo}`,
      type: 'study-session',
      topicId,
      minutes,
      timestamp: at(daysAgo, daysAgo === 0 ? Math.min(now.getHours(), 8) : 20).toISOString(),
      description: `Study session: ${topicById.get(topicId)!.name} (${minutes} min)`,
    });
  }

  activities.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  return {
    ...data,
    results,
    progress,
    completedResourceIds,
    activities: activities.filter((a) => new Date(a.timestamp) <= now),
    settings: { ...data.settings, schedule: { ...data.settings.schedule, examDate: addDays(toISODate(now), 42) } },
  };
}
