import type { NimcetSubjectId } from "./nimcetSyllabus";

export type PreparationStatus = "not_started" | "learning" | "revision" | "strong";

export type QuestionSource = "practice" | "pyq" | "mock";
export type QuestionResult = "correct" | "wrong" | "skipped";
export type MistakeReason =
  | "concept_gap"
  | "calculation_error"
  | "silly_mistake"
  | "misread_question"
  | "time_pressure"
  | "guess"
  | "other";

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

export interface QuestionAttempt {
  id: string;
  subjectId: NimcetSubjectId;
  topicId: string;
  source: QuestionSource;
  result: QuestionResult;
  timeSeconds?: number;
  mistakeReason?: MistakeReason;
  attemptedAt: string;
  note?: string;
}

export interface PyqRecord {
  id: string;
  year: number;
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
  attemptedQuestions: number;
  correctQuestions: number;
  wrongQuestions: number;
  skippedQuestions: number;
  score?: number;
  maxScore?: number;
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
