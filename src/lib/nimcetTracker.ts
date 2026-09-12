import type { NimcetSubjectId } from "./nimcetSyllabus";

export type PreparationStatus = "not_started" | "learning" | "revision" | "strong";
export type QuestionResult = "correct" | "wrong" | "skipped";
export type MistakeReason =
  | "concept_gap"
  | "calculation_error"
  | "silly_mistake"
  | "misread_question"
  | "time_pressure"
  | "guess"
  | "other";

/** Topic-level progress is derived from aggregate DPP/mock data; DPP never stores individual questions. */
export interface TopicProgress {
  topicId: string;
  subjectId: NimcetSubjectId;
  status: PreparationStatus;
  questionsAttempted: number;
  questionsCorrect: number;
  questionsWrong: number;
  questionsSkipped: number;
  lastPracticedAt?: string;
  updatedAt: string;
}

/** Reserved for a future question-bank feature. It is intentionally not used by the DPP workflow. */
export interface QuestionAttempt {
  id: string;
  subjectId: NimcetSubjectId;
  topicId: string;
  result: QuestionResult;
  attemptedAt: string;
  timeSeconds?: number;
  mistakeReason?: MistakeReason;
  note?: string;
}

export interface PyqRecord {
  id: string;
  year: number;
  paper?: string;
  attemptedQuestions: number;
  correctQuestions: number;
  wrongQuestions: number;
  skippedQuestions: number;
  durationMinutes?: number;
  completedAt?: string;
  notes?: string;
}

export interface MockTestRecord {
  id: string;
  title: string;
  unitTitle: string;
  topicIds: string[];
  attemptedQuestions: number;
  correctQuestions: number;
  wrongQuestions: number;
  skippedQuestions: number;
  durationMinutes?: number;
  completedAt: string;
}

export interface NimcetProgressState {
  topicProgress: Record<string, TopicProgress>;
  questionAttempts: QuestionAttempt[];
  pyqs: PyqRecord[];
  mocks: MockTestRecord[];
}

export const EMPTY_NIMCET_PROGRESS: NimcetProgressState = {
  topicProgress: {},
  questionAttempts: [],
  pyqs: [],
  mocks: [],
};
