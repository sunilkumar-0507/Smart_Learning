// Compact authoring format for the built-in sample curriculum.

/** [question, four options, index of the correct option, explanation] */
export type QuestionSeed = [string, [string, string, string, string], 0 | 1 | 2 | 3, string];

export interface TopicSeed {
  /** Full topic id, e.g. "web-html". */
  id: string;
  name: string;
  description: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  importance: number;
  minutes: number;
  prerequisites: string[];
  /** Text explanation resource. */
  explanation: string;
  /** Revision notes resource (bullet points). */
  notes: string[];
  /** Code example resource. */
  code: { language: string; snippet: string };
  /** Practice exercise resource. */
  exercise: string;
  questions: QuestionSeed[];
}

export interface SubjectSeed {
  id: string;
  name: string;
  description: string;
  color: string;
  topics: TopicSeed[];
}
