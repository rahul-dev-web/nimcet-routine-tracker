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
const VERSION = 2;
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
    set((state) => ({
      dpps: [...state.dpps, { ...normalized, id: makeId("dpp"), recordedAt: new Date().toISOString() }],
    }));
    get().persist();
  },
  saveMock: (record) => {
    const normalized = normalizeResult({ ...record, topicIds: normalizeTopics(record.topicIds) });
    if (!normalized.unitTitle.trim() || !normalized.topicIds.length || normalized.questionCount < 1 || !validateQuestionTotals(normalized)) return;
    const subjectIds = [...new Set(normalized.topicIds.map((id) => topicMap.get(id)).filter(Boolean))] as NimcetSubjectId[];
    set((state) => ({
      assessments: [
        ...state.assessments,
        { ...normalized, type: "mock", subjectIds, id: makeId("mock"), recordedAt: new Date().toISOString() },
      ],
    }));
    get().persist();
  },
  savePyq: (record) => {
    const normalized = normalizeResult({ ...record, topicIds: normalizeTopics(record.topicIds) });
    if (!normalized.title.trim() || normalized.year < 2000 || normalized.questionCount < 1 || !validateQuestionTotals(normalized)) return;
    const subjectIds = [...new Set(normalized.topicIds.map((id) => topicMap.get(id)).filter(Boolean))] as NimcetSubjectId[];
    set((state) => ({
      assessments: [
        ...state.assessments,
        { ...normalized, type: "pyq", subjectIds, id: makeId("pyq"), recordedAt: new Date().toISOString() },
      ],
    }));
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
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!parsed) return;
      const legacyAssessments = Array.isArray(parsed.assessments) ? parsed.assessments : [];
      const migratedAssessments: AssessmentRecord[] = legacyAssessments
        .filter((item: Partial<AssessmentRecord>) => item.type === "mock" || item.type === "pyq")
        .map((item: Partial<AssessmentRecord>) => ({
          ...item,
          type: item.type,
          subjectIds: Array.isArray(item.subjectIds) ? item.subjectIds : [],
          topicIds: normalizeTopics(Array.isArray(item.topicIds) ? item.topicIds : []),
          questionCount: clampCount(item.questionCount ?? 0),
          correct: clampCount(item.correct ?? 0),
          wrong: clampCount(item.wrong ?? 0),
          skipped: clampCount(item.skipped ?? 0),
          completed: item.completed !== false,
          recordedAt: item.recordedAt || new Date().toISOString(),
          ...(item.type === "mock" ? { unitTitle: item.unitTitle || item.title || "Unit" } : { year: item.year || new Date().getFullYear() }),
        })) as AssessmentRecord[];
      set({
        version: VERSION,
        dailyTopics: parsed.dailyTopics ?? {},
        dpps: Array.isArray(parsed.dpps) ? parsed.dpps : [],
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
