// Centralised application state. All mutations go through these actions and
// every change is persisted to LocalStorage via the subscription at the bottom.

import { create } from 'zustand';
import type {
  ActivityType,
  AppData,
  AppSettings,
  AssessmentResult,
  LearningResource,
  Question,
  SessionStatus,
  StudentProfile,
  StudySchedule,
  Subject,
  Topic,
  TopicProgress,
} from '@/types';
import { createDemoData, createEmptyData } from '@/data/seed';
import { calculateScore, validateSubmission } from '@/lib/engine/assessment';
import { clearData, loadData, saveData } from '@/lib/storage/storage';
import { createId, slugify } from '@/lib/id';

export type ProfileInput = Omit<StudentProfile, 'id' | 'createdAt'>;
export type SubjectInput = Pick<Subject, 'name' | 'description' | 'color'>;
export type TopicInput = Omit<Topic, 'id' | 'questions' | 'order'>;
export type QuestionInput = Omit<Question, 'id' | 'topicId'> & { id?: string };
export type ResourceInput = Omit<LearningResource, 'id' | 'custom'>;

export interface SubmitAssessmentInput {
  topicId: string;
  answers: Record<string, number | undefined>;
  startedAt: string;
}

interface Actions {
  createProfile: (input: ProfileInput) => void;
  updateProfile: (input: ProfileInput) => void;
  loadDemo: () => void;
  importData: (data: AppData) => void;
  clearAll: () => void;

  addSubject: (input: SubjectInput) => string;
  updateSubject: (id: string, input: SubjectInput) => void;
  deleteSubject: (id: string) => void;

  addTopic: (input: TopicInput) => string;
  updateTopic: (id: string, input: TopicInput) => void;
  deleteTopic: (id: string) => void;
  saveQuestion: (topicId: string, input: QuestionInput) => void;
  deleteQuestion: (topicId: string, questionId: string) => void;

  submitAssessment: (input: SubmitAssessmentInput) => AssessmentResult;

  startTopic: (topicId: string) => void;
  completeTopic: (topicId: string) => void;
  reviewTopic: (topicId: string) => void;
  resetTopic: (topicId: string) => void;

  toggleResource: (resourceId: string) => void;
  addResource: (input: ResourceInput) => void;
  deleteResource: (resourceId: string) => void;

  setSchedule: (schedule: StudySchedule | null) => void;
  setSessionStatus: (sessionId: string, status: SessionStatus) => void;

  updateSettings: (settings: AppSettings) => void;
}

interface Meta {
  /** Message shown when persistence fails or stored data was unreadable. */
  storageError: string | null;
  dismissStorageError: () => void;
}

export type AppState = AppData & Actions & Meta;

const DATA_KEYS: (keyof AppData)[] = ['version', 'profile', 'subjects', 'topics', 'resources', 'results', 'progress', 'completedResourceIds', 'activities', 'schedule', 'settings'];

export function selectData(state: AppState): AppData {
  return Object.fromEntries(DATA_KEYS.map((k) => [k, state[k]])) as unknown as AppData;
}

function initialData(): { data: AppData; error: string | null } {
  if (typeof window === 'undefined') return { data: createEmptyData(), error: null };
  const loaded = loadData();
  if (loaded.status === 'ok') return { data: loaded.data, error: null };
  if (loaded.status === 'error') return { data: createEmptyData(), error: `${loaded.message} A fresh workspace was started.` };
  return { data: createEmptyData(), error: null };
}

const nowIso = () => new Date().toISOString();

function uniqueId(base: string, existing: Set<string>, fallback: string): string {
  const root = slugify(base) || fallback;
  let id = root;
  let n = 2;
  while (existing.has(id)) id = `${root}-${n++}`;
  return id;
}

const { data: startData, error: startError } = initialData();

export const useAppStore = create<AppState>()((set, get) => {
  const activity = (type: ActivityType, description: string, minutes = 0, topicId?: string) => ({
    id: createId('act'),
    type,
    topicId,
    minutes,
    timestamp: nowIso(),
    description,
  });
  const topicName = (id: string) => get().topics.find((t) => t.id === id)?.name ?? 'topic';
  const setProgress = (topicId: string, patch: Partial<TopicProgress>) => {
    const current = get().progress[topicId] ?? { topicId, status: 'not-started' as const };
    return { ...get().progress, [topicId]: { ...current, ...patch } };
  };

  return {
    ...startData,
    storageError: startError,
    dismissStorageError: () => set({ storageError: null }),

    createProfile: (input) => {
      const profile: StudentProfile = { ...input, id: createId('student'), createdAt: nowIso() };
      const data = createEmptyData(profile);
      data.settings.schedule.dailyHours = Math.max(0.5, Math.round((input.dailyStudyMinutes / 60) * 2) / 2);
      set(data);
    },
    updateProfile: (input) => {
      const profile = get().profile;
      if (profile) set({ profile: { ...profile, ...input } });
    },
    loadDemo: () => set(createDemoData()),
    importData: (data) => set(data),
    clearAll: () => {
      clearData();
      set(createEmptyData());
    },

    addSubject: (input) => {
      const id = uniqueId(input.name, new Set(get().subjects.map((s) => s.id)), 'subject');
      set({ subjects: [...get().subjects, { ...input, id, createdAt: nowIso() }] });
      return id;
    },
    updateSubject: (id, input) => set({ subjects: get().subjects.map((s) => (s.id === id ? { ...s, ...input } : s)) }),
    deleteSubject: (id) => {
      const removed = new Set(get().topics.filter((t) => t.subjectId === id).map((t) => t.id));
      const state = get();
      const progress = Object.fromEntries(Object.entries(state.progress).filter(([k]) => !removed.has(k)));
      set({
        subjects: state.subjects.filter((s) => s.id !== id),
        topics: state.topics.filter((t) => !removed.has(t.id)).map((t) => ({ ...t, prerequisites: t.prerequisites.filter((p) => !removed.has(p)) })),
        resources: state.resources.filter((r) => !removed.has(r.topicId)),
        results: state.results.filter((r) => !removed.has(r.topicId)),
        completedResourceIds: state.completedResourceIds.filter((rid) => state.resources.some((r) => r.id === rid && !removed.has(r.topicId))),
        progress,
        schedule: state.schedule ? { ...state.schedule, sessions: state.schedule.sessions.filter((s) => !removed.has(s.topicId)) } : null,
      });
    },

    addTopic: (input) => {
      const state = get();
      const id = uniqueId(`${input.subjectId}-${input.name}`, new Set(state.topics.map((t) => t.id)), 'topic');
      const order = state.topics.filter((t) => t.subjectId === input.subjectId).reduce((m, t) => Math.max(m, t.order + 1), 0);
      set({ topics: [...state.topics, { ...input, id, order, questions: [] }] });
      return id;
    },
    updateTopic: (id, input) => set({ topics: get().topics.map((t) => (t.id === id ? { ...t, ...input, prerequisites: input.prerequisites.filter((p) => p !== id) } : t)) }),
    deleteTopic: (id) => {
      const state = get();
      const { [id]: _removed, ...progress } = state.progress;
      void _removed;
      set({
        topics: state.topics.filter((t) => t.id !== id).map((t) => ({ ...t, prerequisites: t.prerequisites.filter((p) => p !== id) })),
        resources: state.resources.filter((r) => r.topicId !== id),
        results: state.results.filter((r) => r.topicId !== id),
        completedResourceIds: state.completedResourceIds.filter((rid) => !rid.startsWith(`${id}-r-`) && state.resources.find((r) => r.id === rid)?.topicId !== id),
        progress,
        schedule: state.schedule ? { ...state.schedule, sessions: state.schedule.sessions.filter((s) => s.topicId !== id) } : null,
      });
    },
    saveQuestion: (topicId, input) =>
      set({
        topics: get().topics.map((t) => {
          if (t.id !== topicId) return t;
          const question: Question = { ...input, id: input.id ?? createId(`${topicId}-q`), topicId };
          const exists = t.questions.some((q) => q.id === question.id);
          return { ...t, questions: exists ? t.questions.map((q) => (q.id === question.id ? question : q)) : [...t.questions, question] };
        }),
      }),
    deleteQuestion: (topicId, questionId) =>
      set({ topics: get().topics.map((t) => (t.id === topicId ? { ...t, questions: t.questions.filter((q) => q.id !== questionId) } : t)) }),

    submitAssessment: ({ topicId, answers, startedAt }) => {
      const topic = get().topics.find((t) => t.id === topicId);
      if (!topic) throw new Error('Topic not found.');
      const check = validateSubmission(topic.questions, answers);
      if (!check.complete) throw new Error(`Please answer all questions (${check.unanswered.length} remaining).`);
      const scored = calculateScore(topic.questions, answers);
      const completedAt = nowIso();
      const durationSeconds = Math.max(1, Math.round((Date.parse(completedAt) - Date.parse(startedAt)) / 1000));
      const result: AssessmentResult = { id: createId('res'), topicId, subjectId: topic.subjectId, ...scored, startedAt, completedAt, durationSeconds };
      set({
        results: [...get().results, result],
        activities: [...get().activities, activity('assessment', `Completed ${topic.name} assessment (${scored.score}%)`, Math.max(1, Math.round(durationSeconds / 60)), topicId)],
      });
      return result;
    },

    startTopic: (topicId) => {
      const current = get().progress[topicId];
      if (current?.status === 'in-progress') return;
      set({
        progress: setProgress(topicId, { status: 'in-progress', startedAt: current?.startedAt ?? nowIso(), completedAt: undefined }),
        activities: [...get().activities, activity('topic-started', `Started ${topicName(topicId)}`, 0, topicId)],
      });
    },
    completeTopic: (topicId) => {
      const topic = get().topics.find((t) => t.id === topicId);
      if (!topic) return;
      const current = get().progress[topicId];
      set({
        progress: setProgress(topicId, { status: 'completed', startedAt: current?.startedAt ?? nowIso(), completedAt: nowIso() }),
        activities: [...get().activities, activity('topic-completed', `Completed ${topic.name}`, topic.estimatedMinutes, topicId)],
      });
    },
    reviewTopic: (topicId) => {
      set({
        progress: setProgress(topicId, { lastReviewedAt: nowIso() }),
        activities: [...get().activities, activity('topic-reviewed', `Reviewed ${topicName(topicId)}`, 20, topicId)],
      });
    },
    resetTopic: (topicId) => {
      const { [topicId]: _removed, ...progress } = get().progress;
      void _removed;
      set({ progress });
    },

    toggleResource: (resourceId) => {
      const state = get();
      if (state.completedResourceIds.includes(resourceId)) {
        set({ completedResourceIds: state.completedResourceIds.filter((id) => id !== resourceId) });
        return;
      }
      const resource = state.resources.find((r) => r.id === resourceId);
      set({
        completedResourceIds: [...state.completedResourceIds, resourceId],
        activities: resource
          ? [...state.activities, activity('resource-completed', `Finished resource "${resource.title}"`, resource.estimatedMinutes, resource.topicId)]
          : state.activities,
      });
    },
    addResource: (input) => set({ resources: [...get().resources, { ...input, id: createId(`${input.topicId}-custom`), custom: true }] }),
    deleteResource: (resourceId) =>
      set({
        resources: get().resources.filter((r) => r.id !== resourceId),
        completedResourceIds: get().completedResourceIds.filter((id) => id !== resourceId),
      }),

    setSchedule: (schedule) => set({ schedule }),
    setSessionStatus: (sessionId, status) => {
      const schedule = get().schedule;
      if (!schedule) return;
      const session = schedule.sessions.find((s) => s.id === sessionId);
      if (!session || session.status === status) return;
      const activities =
        status === 'completed'
          ? [...get().activities, activity('study-session', `Study session: ${topicName(session.topicId)} (${session.minutes} min)`, session.minutes, session.topicId)]
          : get().activities;
      set({ schedule: { ...schedule, sessions: schedule.sessions.map((s) => (s.id === sessionId ? { ...s, status } : s)) }, activities });
    },

    updateSettings: (settings) => set({ settings }),
  };
});

// Persist every data change. Meta fields are excluded.
let lastSaved: AppData | null = null;
useAppStore.subscribe((state) => {
  const data = selectData(state);
  if (lastSaved && DATA_KEYS.every((k) => lastSaved![k] === data[k])) return;
  lastSaved = data;
  const error = saveData(data);
  if (error && state.storageError !== error) useAppStore.setState({ storageError: error });
});
