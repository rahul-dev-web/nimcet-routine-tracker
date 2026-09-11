import { create } from "zustand";
import {
  ROUTINE_SCHEMA_VERSION,
  buildRoutineForDay,
  getLocalTimeMinutes,
  getTodayDateKey,
  isCollegeQuestionOpen,
} from "@/lib/routineBuilder";

export interface RoutineTask {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  duration: number;
  order: number;
  completed: boolean;
  completedAt?: string;
  category: "study" | "break" | "exercise" | "other";
}

export interface DailyTaskProgress {
  taskId: string;
  completed: boolean;
  completedAt?: string;
}

export interface DailyProgress {
  date: string;
  completedTasks: number;
  totalTasks: number;
  studyHours: number;
  tasks: DailyTaskProgress[];
}

export interface UserProfile {
  name: string;
  wakeUpTime: string;
  sleepTime: string;
  studyTargetHours: number;
  theme: "light" | "dark" | "system";
}

export type CollegePlanStatus = "pending" | "going" | "not_going";

export interface DayPlan {
  date: string;
  college: CollegePlanStatus;
  answeredAt?: string;
  autoDefaulted?: boolean;
}

interface RoutineState {
  profile: UserProfile;
  routineSchemaVersion: number;
  dailyPlans: Map<string, DayPlan>;
  dailyProgress: Map<string, DailyProgress>;
  currentTime: string;

  setProfile: (profile: UserProfile) => void;
  setCollegePlan: (date: string, goingToCollege: boolean) => void;
  resolvePendingCollegePlans: () => void;
  getDayPlan: (date: string) => DayPlan;
  isGoingToCollege: (date: string) => boolean;
  getRoutineForDate: (date: string) => RoutineTask[];
  toggleTaskCompletion: (taskId: string, date: string) => void;
  updateCurrentTime: (time: string) => void;
  getCurrentTask: (date?: string) => RoutineTask | null;
  getNextTask: (date?: string) => RoutineTask | null;
  getDailyProgress: (date: string) => DailyProgress | null;
  calculateStudyHours: (date: string) => number;
  loadFromLocalStorage: () => void;
  saveToLocalStorage: () => void;
}

const DEFAULT_PROFILE: UserProfile = {
  name: "Rahul",
  wakeUpTime: "06:00",
  sleepTime: "23:30",
  studyTargetHours: 8,
  theme: "system",
};

const getTaskCompleted = (progress: DailyProgress | undefined, taskId: string) =>
  progress?.tasks.find((task) => task.taskId === taskId)?.completed ?? false;

const calculateStudyHoursFromProgress = (routine: RoutineTask[], progress: DailyProgress | undefined) => {
  if (!progress) return 0;
  const minutes = routine.reduce(
    (sum, task) => sum + (task.category === "study" && getTaskCompleted(progress, task.id) ? task.duration : 0),
    0
  );
  return Math.round((minutes / 60) * 10) / 10;
};

const isTaskCurrent = (task: RoutineTask, currentMinutes: number) => {
  const [startH, startM] = task.startTime.split(":").map(Number);
  const [endH, endM] = task.endTime.split(":").map(Number);
  const start = startH * 60 + startM;
  const end = endH * 60 + endM;
  return end < start ? currentMinutes >= start || currentMinutes < end : currentMinutes >= start && currentMinutes < end;
};

export const useRoutineStore = create<RoutineState>((set, get) => ({
  profile: DEFAULT_PROFILE,
  routineSchemaVersion: ROUTINE_SCHEMA_VERSION,
  dailyPlans: new Map(),
  dailyProgress: new Map(),
  currentTime: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false }),

  setProfile: (profile) => {
    const safeProfile: UserProfile = {
      ...profile,
      studyTargetHours: Math.min(16, Math.max(1, Number(profile.studyTargetHours) || DEFAULT_PROFILE.studyTargetHours)),
    };
    set({ profile: safeProfile });
    get().saveToLocalStorage();
  },

  setCollegePlan: (date, goingToCollege) => {
    set((state) => {
      const dailyPlans = new Map(state.dailyPlans);
      dailyPlans.set(date, {
        date,
        college: goingToCollege ? "going" : "not_going",
        answeredAt: new Date().toISOString(),
        autoDefaulted: false,
      });
      return { dailyPlans };
    });
    get().saveToLocalStorage();
  },

  resolvePendingCollegePlans: () => {
    const today = getTodayDateKey();
    const plan = get().getDayPlan(today);
    if (plan.college !== "pending" || isCollegeQuestionOpen()) return;
    set((state) => {
      const dailyPlans = new Map(state.dailyPlans);
      dailyPlans.set(today, { date: today, college: "not_going", autoDefaulted: true, answeredAt: new Date().toISOString() });
      return { dailyPlans };
    });
    get().saveToLocalStorage();
  },

  getDayPlan: (date) => get().dailyPlans.get(date) ?? { date, college: "pending" },

  isGoingToCollege: (date) => {
    if (date === getTodayDateKey()) get().resolvePendingCollegePlans();
    return get().getDayPlan(date).college === "going";
  },

  getRoutineForDate: (date) => {
    if (date === getTodayDateKey()) get().resolvePendingCollegePlans();
    return buildRoutineForDay(date, get().isGoingToCollege(date), get().profile);
  },

  updateCurrentTime: (time) => set({ currentTime: time }),

  toggleTaskCompletion: (taskId, date) => {
    const routine = get().getRoutineForDate(date);
    set((state) => {
      const dailyProgress = new Map(state.dailyProgress);
      const previous = dailyProgress.get(date);
      const tasks = routine.map((task) => previous?.tasks.find((item) => item.taskId === task.id) ?? { taskId: task.id, completed: false });
      const index = tasks.findIndex((task) => task.taskId === taskId);
      if (index === -1) return state;

      const completed = !tasks[index].completed;
      tasks[index] = { ...tasks[index], completed, completedAt: completed ? new Date().toISOString() : undefined };
      const next: DailyProgress = {
        date,
        totalTasks: routine.length,
        completedTasks: tasks.filter((task) => task.completed).length,
        studyHours: 0,
        tasks,
      };
      next.studyHours = calculateStudyHoursFromProgress(routine, next);
      dailyProgress.set(date, next);
      return { dailyProgress };
    });
    get().saveToLocalStorage();
  },

  getCurrentTask: (date) => {
    const state = get();
    const targetDate = date ?? getTodayDateKey();
    const routine = state.getRoutineForDate(targetDate);
    const currentMinutes = getLocalTimeMinutesFromString(state.currentTime);
    const progress = state.getDailyProgress(targetDate);
    return routine.find((task) => !getTaskCompleted(progress, task.id) && isTaskCurrent(task, currentMinutes)) ?? null;
  },

  getNextTask: (date) => {
    const targetDate = date ?? getTodayDateKey();
    const routine = get().getRoutineForDate(targetDate);
    const progress = get().getDailyProgress(targetDate);
    const current = get().getCurrentTask(targetDate);
    const start = current ? routine.findIndex((task) => task.id === current.id) + 1 : 0;
    return routine.slice(start).find((task) => !getTaskCompleted(progress, task.id)) ?? null;
  },

  getDailyProgress: (date) => get().dailyProgress.get(date) || null,

  calculateStudyHours: (date) => calculateStudyHoursFromProgress(get().getRoutineForDate(date), get().dailyProgress.get(date)),

  loadFromLocalStorage: () => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("routineStore");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const version = parsed.routineSchemaVersion ?? 1;
        set({
          profile: { ...DEFAULT_PROFILE, ...(parsed.profile || {}) },
          routineSchemaVersion: ROUTINE_SCHEMA_VERSION,
          dailyPlans: new Map(parsed.dailyPlans || []),
          dailyProgress: new Map(parsed.dailyProgress || []),
        });
        if (version < ROUTINE_SCHEMA_VERSION) get().saveToLocalStorage();
      } catch {
        console.error("Failed to load from localStorage");
      }
    }
    get().resolvePendingCollegePlans();
  },

  saveToLocalStorage: () => {
    if (typeof window === "undefined") return;
    const state = get();
    localStorage.setItem("routineStore", JSON.stringify({
      routineSchemaVersion: ROUTINE_SCHEMA_VERSION,
      profile: state.profile,
      dailyPlans: Array.from(state.dailyPlans.entries()),
      dailyProgress: Array.from(state.dailyProgress.entries()),
    }));
  },
}));

function getLocalTimeMinutesFromString(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}
