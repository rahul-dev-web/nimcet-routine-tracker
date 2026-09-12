import { create } from "zustand";

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

export interface AssessmentRecord {
  id: string;
  type: Exclude<AssessmentType, "dpp">;
  date: string;
  title: string;
  subjectIds: string[];
  topicIds: string[];
  questionCount: number;
  correct: number;
  wrong: number;
  skipped: number;
  score?: number;
  completed: boolean;
  recordedAt: string;
}

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
  saveAssessment: (record: Omit<AssessmentRecord, "id" | "recordedAt">) => void;
  deleteDpp: (id: string) => void;
  deleteAssessment: (id: string) => void;
  load: () => void;
  persist: () => void;
}

const STORAGE_KEY = "nimcetTracker";
const VERSION = 1;
const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const useNimcetStore = create<NimcetState>((set, get) => ({
  version: VERSION,
  dailyTopics: {},
  dpps: [],
  assessments: [],
  recordDailyTopics: (date, topicIds, note) => {
    set((state) => ({
      dailyTopics: {
        ...state.dailyTopics,
        [date]: { date, topicIds: [...new Set(topicIds)], note: note?.trim() || undefined, recordedAt: new Date().toISOString() },
      },
    }));
    get().persist();
  },
  saveDpp: (record) => {
    const normalized = { ...record, questionCount: Math.max(0, record.questionCount), correct: Math.max(0, record.correct), wrong: Math.max(0, record.wrong), skipped: Math.max(0, record.skipped) };
    set((state) => ({ dpps: [...state.dpps, { ...normalized, id: makeId("dpp"), recordedAt: new Date().toISOString() }] }));
    get().persist();
  },
  saveAssessment: (record) => {
    set((state) => ({ assessments: [...state.assessments, { ...record, id: makeId(record.type), recordedAt: new Date().toISOString() }] }));
    get().persist();
  },
  deleteDpp: (id) => { set((state) => ({ dpps: state.dpps.filter((item) => item.id !== id) })); get().persist(); },
  deleteAssessment: (id) => { set((state) => ({ assessments: state.assessments.filter((item) => item.id !== id) })); get().persist(); },
  load: () => {
    if (typeof window === "undefined") return;
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!parsed) return;
      set({ version: VERSION, dailyTopics: parsed.dailyTopics ?? {}, dpps: parsed.dpps ?? [], assessments: parsed.assessments ?? [] });
    } catch { console.error("Failed to load NIMCET tracker data"); }
  },
  persist: () => {
    if (typeof window === "undefined") return;
    const state = get();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: VERSION, dailyTopics: state.dailyTopics, dpps: state.dpps, assessments: state.assessments }));
  },
}));

export const accuracyOf = (correct: number, wrong: number, skipped: number) => {
  const attempted = correct + wrong;
  return attempted ? Math.round((correct / attempted) * 1000) / 10 : 0;
};
