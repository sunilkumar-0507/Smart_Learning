// Form validation rules shared by create/edit dialogs. Each validator returns a
// map of field → message; an empty map means the input is valid.

import type { EducationLevel } from '@/types';

export type FieldErrors<K extends string> = Partial<Record<K, string>>;

export const EDUCATION_LEVELS: EducationLevel[] = ['High School', 'Diploma', 'Undergraduate', 'Postgraduate', 'Self-learner', 'Professional'];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export interface ProfileFormValues {
  name: string;
  email: string;
  interests: string[];
  educationLevel: EducationLevel;
  dailyStudyMinutes: number;
  learningGoals: string;
}

export function validateProfile(v: ProfileFormValues): FieldErrors<keyof ProfileFormValues> {
  const e: FieldErrors<keyof ProfileFormValues> = {};
  if (v.name.trim().length < 2) e.name = 'Enter your name (at least 2 characters).';
  else if (v.name.trim().length > 80) e.name = 'Name must be 80 characters or fewer.';
  if (!EMAIL.test(v.email.trim())) e.email = 'Enter a valid email address.';
  if (!EDUCATION_LEVELS.includes(v.educationLevel)) e.educationLevel = 'Choose an education level.';
  if (!Number.isFinite(v.dailyStudyMinutes) || v.dailyStudyMinutes < 15 || v.dailyStudyMinutes > 720) e.dailyStudyMinutes = 'Daily study time must be between 15 and 720 minutes.';
  if (v.learningGoals.length > 500) e.learningGoals = 'Keep goals under 500 characters.';
  return e;
}

export interface SubjectFormValues {
  name: string;
  description: string;
  color: string;
}

export function validateSubject(v: SubjectFormValues, existingNames: string[]): FieldErrors<keyof SubjectFormValues> {
  const e: FieldErrors<keyof SubjectFormValues> = {};
  const name = v.name.trim();
  if (name.length < 2) e.name = 'Subject name must be at least 2 characters.';
  else if (existingNames.some((n) => n.toLowerCase() === name.toLowerCase())) e.name = 'A subject with this name already exists.';
  if (!/^#[0-9a-f]{6}$/i.test(v.color)) e.color = 'Choose a colour.';
  if (v.description.length > 300) e.description = 'Keep the description under 300 characters.';
  return e;
}

export interface TopicFormValues {
  name: string;
  description: string;
  difficulty: number;
  importance: number;
  estimatedMinutes: number;
  prerequisites: string[];
}

export function validateTopic(v: TopicFormValues, existingNames: string[]): FieldErrors<keyof TopicFormValues> {
  const e: FieldErrors<keyof TopicFormValues> = {};
  const name = v.name.trim();
  if (name.length < 2) e.name = 'Topic name must be at least 2 characters.';
  else if (existingNames.some((n) => n.toLowerCase() === name.toLowerCase())) e.name = 'This subject already has a topic with this name.';
  if (!Number.isInteger(v.difficulty) || v.difficulty < 1 || v.difficulty > 5) e.difficulty = 'Difficulty must be 1–5.';
  if (!Number.isFinite(v.importance) || v.importance < 0 || v.importance > 100) e.importance = 'Importance must be between 0 and 100.';
  if (!Number.isFinite(v.estimatedMinutes) || v.estimatedMinutes < 5 || v.estimatedMinutes > 1440) e.estimatedMinutes = 'Estimated time must be 5–1440 minutes.';
  return e;
}

export interface QuestionFormValues {
  text: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
}

export function validateQuestion(v: QuestionFormValues): FieldErrors<'text' | 'options' | 'correctIndex' | 'explanation'> {
  const e: FieldErrors<'text' | 'options' | 'correctIndex' | 'explanation'> = {};
  if (v.text.trim().length < 5) e.text = 'Write the question (at least 5 characters).';
  const options = v.options.map((o) => o.trim());
  if (options.some((o) => o.length === 0)) e.options = 'All four answer options are required.';
  else if (new Set(options.map((o) => o.toLowerCase())).size !== 4) e.options = 'Answer options must be different from each other.';
  if (![0, 1, 2, 3].includes(v.correctIndex)) e.correctIndex = 'Select the correct answer.';
  if (v.explanation.trim().length < 5) e.explanation = 'Explain why the answer is correct.';
  return e;
}

export const hasErrors = (errors: Record<string, string | undefined>) => Object.values(errors).some(Boolean);
