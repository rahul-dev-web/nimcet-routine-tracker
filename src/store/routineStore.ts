import { create } from "zustand";
import {
  ROUTINE_SCHEMA_VERSION,
  buildRoutineForDay,
  getTodayDateKey,
  isCollegeQuestionOpen,
} from "@/lib/routineBuilder";

export interface RoutineTask {
  id: string;
  title: string;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  duration: number; // in minutes
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
  wakeUpTime: string; // HH:mm
  sleepTime: string; // HH:mm
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
  wakeUpTime: "07:00",
  sleepTime: "23:30",
  studyTargetHours: 8,
  theme: "system",
};

export const useRoutineStore = create<RoutineState>((set, get) => ({
  profile: DEFAULT_PROFILE,
  routineSchemaVersion: ROUTINE_SCHEMA_VERSION,
  dailyPlans: new Map(),
  dailyProgress: new Map(),
  currentTime: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false }),

  setProfile: (profile) => {
    set({ profile });
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
    if (plan.college !== "pending") return;
    if (isCollegeQuestionOpen()) return;

    set((state) => {
      const dailyPlans = new Map(state.dailyPlans);
      dailyPlans.set(today, {
        date: today,
        college: "not_going",
        autoDefaulted: true,
        answeredAt: new Date().toISOString(),
      });
      return { dailyPlans };
    });
    get().saveToLocalStorage();
  },

  getDayPlan: (date) => {
    return get().dailyPlans.get(date) ?? { date, college: "pending" };
  },

  isGoingToCollege: (date) => {
    get().resolvePendingCollegePlans();
    return get().getDayPlan(date).college === "going";
  },

  getRoutineForDate: (date) => {
    get().resolvePendingCollegePlans();
    const going = get().isGoingToCollege(date);
    return buildRoutineForDate(date, going);
  },

  updateCurrentTime: (time) => {
    set({ currentTime: time });
  },

  toggleTaskCompletion: (taskId, date) => {
    const routine = get().getRoutineForDate(date);

    set((state) => {
      const updatedProgress = new Map(state.dailyProgress);
      const dayProgress = updatedProgress.get(date) || {
        date,
        completedTasks: 0,
        totalTasks: routine.length,
        studyHours: 0,
        tasks: routine.map((t): DailyTaskProgress => ({ taskId: t.id, completed: false })),
      };

      if (dayProgress.totalTasks !== routine.length) {
        dayProgress.totalTasks = routine.length;
        dayProgress.tasks = routine.map((t) => {
          const prev = dayProgress.tasks.find((p) => p.taskId === t.id);
          return prev ?? { taskId: t.id, completed: false };
        });
      }

      const taskIndex = dayProgress.tasks.findIndex((t) => t.taskId === taskId);
      if (taskIndex !== -1) {
        const taskProgress = dayProgress.tasks[taskIndex];
        taskProgress.completed = !taskProgress.completed;
        taskProgress.completedAt = taskProgress.completed ? new Date().toISOString() : undefined;
        dayProgress.completedTasks = dayProgress.tasks.filter((t) => t.completed).length;
      }

      updatedProgress.set(date, dayProgress);
      return { dailyProgress: updatedProgress };
    });

    get().saveToLocalStorage();
  },

  getCurrentTask: (date) => {
    const state = get();
    const targetDate = date ?? getTodayDateKey();
    const routine = state.getRoutineForDate(targetDate);

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return (
      routine.find((task) => {
        const [startH, startM] = task.startTime.split(":").map(Number);
        const [endH, endM] = task.endTime.split(":").map(Number);
        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;

        if (endMinutes < startMinutes) {
          return currentMinutes >= startMinutes || currentMinutes < endMinutes;
        }

        return currentMinutes >= startMinutes && currentMinutes < endMinutes;
      }) || null
    );
  },

  getNextTask: (date) => {
    const state = get();
    const targetDate = date ?? getTodayDateKey();
    const routine = state.getRoutineForDate(targetDate);
    const currentTask = state.getCurrentTask(targetDate);
    if (!currentTask) return routine[0] || null;

    const currentIndex = routine.findIndex((t) => t.id === currentTask.id);
    return currentIndex !== -1 && currentIndex + 1 < routine.length ? routine[currentIndex + 1] : null;
  },

  getDailyProgress: (date) => {
    return get().dailyProgress.get(date) || null;
  },

  calculateStudyHours: (date) => {
    const state = get();
    const dayProgress = state.dailyProgress.get(date);
    if (!dayProgress) return 0;

    const routine = state.getRoutineForDate(date);
    let studyMinutes = 0;
    routine.forEach((task) => {
      if (task.category === "study") {
        const taskProgress = dayProgress.tasks.find((t) => t.taskId === task.id);
        if (taskProgress?.completed) {
          studyMinutes += task.duration;
        }
      }
    });

    return Math.round((studyMinutes / 60) * 10) / 10;
  },

  loadFromLocalStorage: () => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem("routineStore");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const version = parsed.routineSchemaVersion ?? 1;

        set({
          profile: { ...DEFAULT_PROFILE, ...(parsed.profile || {}) },
          routineSchemaVersion: version >= ROUTINE_SCHEMA_VERSION ? version : ROUTINE_SCHEMA_VERSION,
          dailyPlans: new Map(parsed.dailyPlans || []),
          dailyProgress: new Map(parsed.dailyProgress || []),
        });

        if (version < ROUTINE_SCHEMA_VERSION) {
          get().saveToLocalStorage();
        }
      } catch {
        console.error("Failed to load from localStorage");
      }
    }

    get().resolvePendingCollegePlans();
  },

  saveToLocalStorage: () => {
    if (typeof window === "undefined") return;

    const state = get();
    const toStore = {
      routineSchemaVersion: ROUTINE_SCHEMA_VERSION,
      profile: state.profile,
      dailyPlans: Array.from(state.dailyPlans.entries()),
      dailyProgress: Array.from(state.dailyProgress.entries()),
    };

    localStorage.setItem("routineStore", JSON.stringify(toStore));
  },
}));
