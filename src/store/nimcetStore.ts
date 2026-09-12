import { create } from "zustand";
import type { NimcetSubjectId } from "@/lib/nimcetSyllabus";
import { NIMCET_SYLLABUS } from "@/lib/nimcetSyllabus";
import { accuracyOf, validateQuestionTotals } from "@/lib/nimcetTrackerMetrics";

export type AssessmentType = "dpp" | "mock" | "pyq";

export interface DppRecord {
  id: string;
  date: string;
  topicIds: string[];
  questionCount: number;
  correct: number;
  wrong: number;
  skipped: number;
  completed: boolean;
  recordedAt: string;
}

export interface MockRecord {
  id: string;
  type: "mock";
  date: string;
  title: string;
  unitTitle: string;
  subjectIds: NimcetSubjectId[];
  topicIds: string[];
  questionCount: number;
  correct: number;
  wrong: number;
  skipped: number;
  durationMinutes?: number;
  completed: boolean;
  recordedAt: string;
}

export interface PyqRecord {
  id: string;
  type: "pyq";
  date: string;
  title: string;
  year: number;
  paper?: string;
  subjectIds: NimcetSubjectId[];
  topicIds: string[];
  questionCount: number;
  correct: number;
  wrong: number;
  skipped: number;
  durationMinutes?: number;
  completed: boolean;
  recordedAt: string;
}

export type AssessmentRecord = MockRecord | PyqRecord;

export interface DailyTopicStudyRecord {
  date: string;
  topicIds: string[];
  note?: string;
  recordedAt: string;
}

interface NimcetState {
  version: number;
  dailyTopics: Record<string, DailyTopicStudyRecord>;
  dpps: DppRecord[];
  assessments: AssessmentRecord[];
  recordDailyTopics: (date: string, topicIds: string[], note?: string) => void;
  saveDpp: (record: Omit<DppRecord, "id" | "recordedAt">) => void;
  saveMock: (record: Omit<MockRecord, "id" | "recordedAt" | "type">) => void;
  savePyq: (record: Omit<PyqRecord, "id" | "recordedAt" | "type">) => void;
  deleteDpp: (id: string) => void;
  deleteAssessment: (id: string) => void;
  load: () => void;
  persist: () => void;
}

const STORAGE_KEY = "nimcetTracker";
const VERSION = 3;
const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const clampCount = (value: number) => Math.max(0, Math.floor(Number.isFinite(value) ? value : 0));
const topicMap = new Map(NIMCET_SYLLABUS.flatMap((subject) => subject.topics.map((topic) => [topic.id, subject.id] as const)));

function normalizeTopics(topicIds: string[]) {
  return [...new Set(topicIds)].filter((id) => topicMap.has(id));
}

function normalizeResult<T extends { questionCount: number; correct: number; wrong: number; skipped: number }>(record: T): T {
  return {
    ...record,
    questionCount: clampCount(record.questionCount),
    correct: clampCount(record.correct),
    wrong: clampCount(record.wrong),
    skipped: clampCount(record.skipped),
  };
}

function subjectIdsForTopics(topicIds: string[]): NimcetSubjectId[] {
  return [...new Set(topicIds.map((id) => topicMap.get(id)).filter(Boolean))] as NimcetSubjectId[];
}

export const useNimcetStore = create<NimcetState>((set, get) => ({
  version: VERSION,
  dailyTopics: {},
  dpps: [],
  assessments: [],

  recordDailyTopics: (date, topicIds, note) => {
    set((state) => ({
      dailyTopics: {
        ...state.dailyTopics,
        [date]: {
          date,
          topicIds: normalizeTopics(topicIds),
          note: note?.trim() || undefined,
          recordedAt: new Date().toISOString(),
        },
      },
    }));
    get().persist();
  },

  saveDpp: (record) => {
    const normalized = normalizeResult({ ...record, topicIds: normalizeTopics(record.topicIds) });
    if (!normalized.topicIds.length || normalized.questionCount < 1 || !validateQuestionTotals(normalized)) return;
    const next: DppRecord = { ...normalized, id: makeId("dpp"), recordedAt: new Date().toISOString() };
    set((state) => ({ dpps: [...state.dpps.filter((item) => item.date !== next.date), next] }));
    get().persist();
  },

  saveMock: (record) => {
    const normalized = normalizeResult({ ...record, topicIds: normalizeTopics(record.topicIds) });
    if (!normalized.unitTitle.trim() || !normalized.topicIds.length || normalized.questionCount < 1 || !validateQuestionTotals(normalized)) return;
    const next: MockRecord = {
      ...normalized,
      type: "mock",
      subjectIds: subjectIdsForTopics(normalized.topicIds),
      id: makeId("mock"),
      recordedAt: new Date().toISOString(),
    };
    set((state) => ({ assessments: [...state.assessments, next] }));
    get().persist();
  },

  savePyq: (record) => {
    const normalized = normalizeResult({ ...record, topicIds: normalizeTopics(record.topicIds) });
    if (!normalized.title.trim() || normalized.year < 2000 || normalized.questionCount < 1 || !validateQuestionTotals(normalized)) return;
    const next: PyqRecord = {
      ...normalized,
      type: "pyq",
      subjectIds: subjectIdsForTopics(normalized.topicIds),
      id: makeId("pyq"),
      recordedAt: new Date().toISOString(),
    };
    set((state) => ({ assessments: [...state.assessments, next] }));
    get().persist();
  },

  deleteDpp: (id) => {
    set((state) => ({ dpps: state.dpps.filter((item) => item.id !== id) }));
    get().persist();
  },

  deleteAssessment: (id) => {
    set((state) => ({ assessments: state.assessments.filter((item) => item.id !== id) }));
    get().persist();
  },

  load: () => {
    if (typeof window === "undefined") return;
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!parsed || typeof parsed !== "object") return;
      const data = parsed as Record<string, unknown>;
      const rawAssessments = Array.isArray(data.assessments) ? data.assessments : [];
      const migratedAssessments: AssessmentRecord[] = rawAssessments.flatMap((raw) => {
        if (!raw || typeof raw !== "object") return [];
        const item = raw as Record<string, unknown>;
        const type = item.type;
        const topicIds = normalizeTopics(Array.isArray(item.topicIds) ? item.topicIds.filter((id): id is string => typeof id === "string") : []);
        const common = {
          date: typeof item.date === "string" ? item.date : new Date().toISOString().slice(0, 10),
          title: typeof item.title === "string" ? item.title : "Assessment",
          subjectIds: subjectIdsForTopics(topicIds),
          topicIds,
          questionCount: clampCount(Number(item.questionCount)),
          correct: clampCount(Number(item.correct)),
          wrong: clampCount(Number(item.wrong)),
          skipped: clampCount(Number(item.skipped)),
          completed: item.completed !== false,
          recordedAt: typeof item.recordedAt === "string" ? item.recordedAt : new Date().toISOString(),
        };

        if (type === "mock") {
          const unitTitle = typeof item.unitTitle === "string" && item.unitTitle.trim() ? item.unitTitle : common.title;
          return [{
            ...common,
            type: "mock",
            unitTitle,
            id: typeof item.id === "string" ? item.id : makeId("mock"),
            ...(typeof item.durationMinutes === "number" ? { durationMinutes: item.durationMinutes } : {}),
          } as MockRecord];
        }

        if (type === "pyq") {
          const yearValue = Number(item.year);
          return [{
            ...common,
            type: "pyq",
            year: Number.isFinite(yearValue) && yearValue >= 2000 ? yearValue : new Date().getFullYear(),
            paper: typeof item.paper === "string" ? item.paper : undefined,
            id: typeof item.id === "string" ? item.id : makeId("pyq"),
            ...(typeof item.durationMinutes === "number" ? { durationMinutes: item.durationMinutes } : {}),
          } as PyqRecord];
        }

        return [];
      });

      const rawDpps = Array.isArray(data.dpps) ? data.dpps : [];
      const dpps: DppRecord[] = rawDpps.flatMap((raw) => {
        if (!raw || typeof raw !== "object") return [];
        const item = raw as Record<string, unknown>;
        const topicIds = normalizeTopics(Array.isArray(item.topicIds) ? item.topicIds.filter((id): id is string => typeof id === "string") : []);
        const questionCount = clampCount(Number(item.questionCount));
        const correct = clampCount(Number(item.correct));
        const wrong = clampCount(Number(item.wrong));
        const skipped = clampCount(Number(item.skipped));
        if (!topicIds.length || questionCount < 1 || correct + wrong + skipped !== questionCount) return [];
        return [{
          id: typeof item.id === "string" ? item.id : makeId("dpp"),
          date: typeof item.date === "string" ? item.date : new Date().toISOString().slice(0, 10),
          topicIds,
          questionCount,
          correct,
          wrong,
          skipped,
          completed: item.completed !== false,
          recordedAt: typeof item.recordedAt === "string" ? item.recordedAt : new Date().toISOString(),
        }];
      });

      set({
        version: VERSION,
        dailyTopics: data.dailyTopics && typeof data.dailyTopics === "object" ? data.dailyTopics as Record<string, DailyTopicStudyRecord> : {},
        dpps,
        assessments: migratedAssessments,
      });
    } catch {
      console.error("Failed to load NIMCET tracker data");
    }
  },

  persist: () => {
    if (typeof window === "undefined") return;
    const state = get();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: VERSION,
      dailyTopics: state.dailyTopics,
      dpps: state.dpps,
      assessments: state.assessments,
    }));
  },
}));

export { accuracyOf };
