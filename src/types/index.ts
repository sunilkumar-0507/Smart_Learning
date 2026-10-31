// Core domain model for the Smart Learning Path Recommendation System.
// All entities are persisted locally (see src/lib/storage).

export type EducationLevel =
  | 'High School'
  | 'Diploma'
  | 'Undergraduate'
  | 'Postgraduate'
  | 'Self-learner'
  | 'Professional';

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  interests: string[];
  educationLevel: EducationLevel;
  /** Preferred daily study time in minutes. */
  dailyStudyMinutes: number;
  learningGoals: string;
  createdAt: string;
}

export interface Subject {
  id: string;
  name: string;
  description: string;
  /** Tailwind-friendly hex colour used for charts and badges. */
  color: string;
  createdAt: string;
}

/** Difficulty on a 1 (introductory) to 5 (advanced) scale. */
export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

export interface Question {
  id: string;
  topicId: string;
  text: string;
  /** Exactly four answer options. */
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
}

export interface Topic {
  id: string;
  subjectId: string;
  name: string;
  description: string;
  difficulty: DifficultyLevel;
  /** Curriculum importance, 0–100. */
  importance: number;
  estimatedMinutes: number;
  /** Ids of topics that must be mastered first. */
  prerequisites: string[];
  questions: Question[];
  /** Position within the subject's curriculum. */
  order: number;
}

/** An assessment is built on demand from a topic's question bank. */
export interface Assessment {
  topicId: string;
  title: string;
  questions: Question[];
}

export interface AnswerRecord {
  questionId: string;
  selectedIndex: number;
  correct: boolean;
}

export interface AssessmentResult {
  id: string;
  topicId: string;
  subjectId: string;
  /** Percentage score 0–100. */
  score: number;
  correctCount: number;
  totalQuestions: number;
  answers: AnswerRecord[];
  startedAt: string;
  completedAt: string;
  durationSeconds: number;
}

export type ResourceType = 'text' | 'code' | 'exercise' | 'notes' | 'quiz';

export interface LearningResource {
  id: string;
  topicId: string;
  type: ResourceType;
  title: string;
  content: string;
  /** Optional language hint for code resources. */
  language?: string;
  estimatedMinutes: number;
  /** True when created by the student rather than shipped as sample content. */
  custom?: boolean;
}

export type TopicStatus = 'not-started' | 'in-progress' | 'completed';

export interface TopicProgress {
  topicId: string;
  status: TopicStatus;
  startedAt?: string;
  completedAt?: string;
  lastReviewedAt?: string;
}

export type PriorityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export interface PriorityFactors {
  /** Knowledge gap G, 0–100. */
  gap: number;
  /** Normalised difficulty D, 0–100. */
  difficulty: number;
  /** Importance I, 0–100. */
  importance: number;
  /** Revision requirement R, 0–100. */
  revision: number;
}

export type RecommendationKind = 'learn' | 'review';

export interface Recommendation {
  topicId: string;
  rank: number;
  priority: number;
  level: PriorityLevel;
  factors: PriorityFactors;
  kind: RecommendationKind;
  locked: boolean;
  /** Prerequisites that are not yet satisfied. */
  missingPrerequisites: string[];
  inCycle: boolean;
  weak: boolean;
  assessed: boolean;
  reasons: string[];
}

export type SessionStatus = 'planned' | 'completed' | 'missed';

export interface StudySession {
  id: string;
  /** ISO date (YYYY-MM-DD). */
  date: string;
  topicId: string;
  minutes: number;
  kind: RecommendationKind;
  status: SessionStatus;
  /** Original date when a missed session was moved. */
  rescheduledFrom?: string;
}

export interface ScheduleSettings {
  dailyHours: number;
  /** 0 = Sunday … 6 = Saturday. */
  studyDays: number[];
  /** ISO date or empty string when no exam is set. */
  examDate: string;
  /** Maximum length of a single session in minutes. */
  maxSessionMinutes: number;
}

export type ConflictType = 'over-capacity' | 'after-deadline' | 'no-study-days' | 'past-deadline';

export interface ScheduleConflict {
  type: ConflictType;
  message: string;
  topicId?: string;
}

export interface StudySchedule {
  id: string;
  generatedAt: string;
  startDate: string;
  settings: ScheduleSettings;
  sessions: StudySession[];
  conflicts: ScheduleConflict[];
  unscheduledTopicIds: string[];
}

export type ActivityType =
  | 'assessment'
  | 'topic-started'
  | 'topic-completed'
  | 'topic-reviewed'
  | 'resource-completed'
  | 'study-session';

export interface LearningActivity {
  id: string;
  type: ActivityType;
  topicId?: string;
  minutes: number;
  timestamp: string;
  description: string;
}

export interface PriorityWeights {
  gap: number;
  difficulty: number;
  importance: number;
  revision: number;
}

export interface PerformanceThresholds {
  /** Scores below this are "Needs Improvement". */
  developing: number;
  /** Scores below this (and ≥ developing) are "Developing". */
  good: number;
  /** Scores above this are "Excellent". */
  excellent: number;
}

export interface EngineSettings {
  weights: PriorityWeights;
  /** Gap assumed for topics that have never been assessed. */
  defaultUnassessedGap: number;
  /** Score at which a prerequisite counts as mastered even if not marked completed. */
  prerequisiteMastery: number;
  /** Memory stability (days) for the revision forgetting curve. */
  revisionStabilityDays: number;
  /** Revision requirement at which a completed topic is suggested for review. */
  reviewThreshold: number;
}

export interface AppSettings {
  engine: EngineSettings;
  thresholds: PerformanceThresholds;
  schedule: ScheduleSettings;
}

export interface AppData {
  version: number;
  profile: StudentProfile | null;
  subjects: Subject[];
  topics: Topic[];
  resources: LearningResource[];
  results: AssessmentResult[];
  progress: Record<string, TopicProgress>;
  completedResourceIds: string[];
  activities: LearningActivity[];
  schedule: StudySchedule | null;
  settings: AppSettings;
}
