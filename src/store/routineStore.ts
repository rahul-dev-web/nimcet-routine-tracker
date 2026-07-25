import { create } from "zustand";

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

interface RoutineState {
  profile: UserProfile;
  routine: RoutineTask[];
  dailyProgress: Map<string, DailyProgress>;
  currentTime: string;
  
  // Actions
  setProfile: (profile: UserProfile) => void;
  setRoutine: (routine: RoutineTask[]) => void;
  toggleTaskCompletion: (taskId: string, date: string) => void;
  updateCurrentTime: (time: string) => void;
  getCurrentTask: () => RoutineTask | null;
  getNextTask: () => RoutineTask | null;
  getDailyProgress: (date: string) => DailyProgress | null;
  calculateStudyHours: (date: string) => number;
  loadFromLocalStorage: () => void;
  saveToLocalStorage: () => void;
}

const DEFAULT_ROUTINE: RoutineTask[] = [
  { id: "1", title: "Wake up, drink water", startTime: "06:00", endTime: "06:10", duration: 10, order: 1, completed: false, category: "other" },
  { id: "2", title: "Jogging + exercise", startTime: "06:10", endTime: "07:00", duration: 50, order: 2, completed: false, category: "exercise" },
  { id: "3", title: "Freshen up", startTime: "07:00", endTime: "07:30", duration: 30, order: 3, completed: false, category: "other" },
  { id: "4", title: "Breakfast + chores", startTime: "07:30", endTime: "08:15", duration: 45, order: 4, completed: false, category: "other" },
  { id: "5", title: "Revision (Flashcards/Formula)", startTime: "08:15", endTime: "08:50", duration: 35, order: 5, completed: false, category: "study" },
  { id: "6", title: "Get ready to leave for college", startTime: "08:50", endTime: "09:00", duration: 10, order: 6, completed: false, category: "other" },
  { id: "7", title: "Travel to college", startTime: "09:00", endTime: "09:30", duration: 30, order: 7, completed: false, category: "other" },
  { id: "8", title: "Organize notes / plan", startTime: "09:30", endTime: "10:00", duration: 30, order: 8, completed: false, category: "study" },
  { id: "9", title: "Maths (Concept + Practice)", startTime: "10:00", endTime: "12:00", duration: 120, order: 9, completed: false, category: "study" },
  { id: "10", title: "Break", startTime: "12:00", endTime: "12:15", duration: 15, order: 10, completed: false, category: "break" },
  { id: "11", title: "Reasoning / Computer", startTime: "12:15", endTime: "13:15", duration: 60, order: 11, completed: false, category: "study" },
  { id: "12", title: "Lunch", startTime: "13:15", endTime: "13:45", duration: 30, order: 12, completed: false, category: "break" },
  { id: "13", title: "PYQs + Question Practice", startTime: "13:45", endTime: "15:15", duration: 90, order: 13, completed: false, category: "study" },
  { id: "14", title: "Break", startTime: "15:15", endTime: "15:30", duration: 15, order: 14, completed: false, category: "break" },
  { id: "15", title: "Topic Test / Sectional Test", startTime: "15:30", endTime: "16:30", duration: 60, order: 15, completed: false, category: "study" },
  { id: "16", title: "Review wrong questions", startTime: "16:30", endTime: "17:00", duration: 30, order: 16, completed: false, category: "study" },
  { id: "17", title: "Head home", startTime: "17:00", endTime: "17:30", duration: 30, order: 17, completed: false, category: "other" },
  { id: "18", title: "Walk / relax", startTime: "17:30", endTime: "19:00", duration: 90, order: 18, completed: false, category: "break" },
  { id: "19", title: "Deep Study (Weak topics)", startTime: "19:00", endTime: "21:00", duration: 120, order: 19, completed: false, category: "study" },
  { id: "20", title: "Dinner", startTime: "21:00", endTime: "21:30", duration: 30, order: 20, completed: false, category: "break" },
  { id: "21", title: "Development / Projects", startTime: "21:30", endTime: "22:30", duration: 60, order: 21, completed: false, category: "study" },
  { id: "22", title: "Daily revision + plan for tomorrow", startTime: "22:30", endTime: "23:00", duration: 30, order: 22, completed: false, category: "study" },
  { id: "23", title: "Games / entertainment", startTime: "23:00", endTime: "23:30", duration: 30, order: 23, completed: false, category: "other" },
  { id: "24", title: "Sleep", startTime: "23:30", endTime: "06:00", duration: 390, order: 24, completed: false, category: "other" },
];

const DEFAULT_PROFILE: UserProfile = {
  name: "Rahul",
  wakeUpTime: "06:00",
  sleepTime: "23:30",
  studyTargetHours: 8,
  theme: "system",
};

export const useRoutineStore = create<RoutineState>((set, get) => ({
  profile: DEFAULT_PROFILE,
  routine: DEFAULT_ROUTINE,
  dailyProgress: new Map(),
  currentTime: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false }),

  setProfile: (profile) => {
    set({ profile });
    get().saveToLocalStorage();
  },

  setRoutine: (routine) => {
    set({ routine });
    get().saveToLocalStorage();
  },

  updateCurrentTime: (time) => {
    set({ currentTime: time });
  },

  toggleTaskCompletion: (taskId, date) => {
    set((state) => {
      const updatedProgress = new Map(state.dailyProgress);
      const dayProgress = updatedProgress.get(date) || {
        date,
        completedTasks: 0,
        totalTasks: state.routine.length,
        studyHours: 0,
        tasks: state.routine.map((t): DailyTaskProgress => ({ taskId: t.id, completed: false })),
      };

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

  getCurrentTask: () => {
    const state = get();
    const now = new Date();
    const currentTimeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });

    return state.routine.find((task) => {
      const [startH, startM] = task.startTime.split(":").map(Number);
      const [endH, endM] = task.endTime.split(":").map(Number);
      const [currH, currM] = currentTimeStr.split(":").map(Number);

      const startInMinutes = startH * 60 + startM;
      const endInMinutes = endH * 60 + endM;
      const currentInMinutes = currH * 60 + currM;

      return currentInMinutes >= startInMinutes && currentInMinutes < endInMinutes;
    }) || null;
  },

  getNextTask: () => {
    const state = get();
    const currentTask = get().getCurrentTask();
    if (!currentTask) return state.routine[0] || null;

    const currentIndex = state.routine.findIndex((t) => t.id === currentTask.id);
    return currentIndex !== -1 && currentIndex + 1 < state.routine.length ? state.routine[currentIndex + 1] : null;
  },

  getDailyProgress: (date) => {
    return get().dailyProgress.get(date) || null;
  },

  calculateStudyHours: (date) => {
    const state = get();
    const dayProgress = state.dailyProgress.get(date);
    if (!dayProgress) return 0;

    let studyMinutes = 0;
    state.routine.forEach((task) => {
      if (task.category === "study") {
        const taskProgress = dayProgress.tasks.find((t) => t.taskId === task.id);
        if (taskProgress?.completed) {
          studyMinutes += task.duration;
        }
      }
    });

    return Math.round((studyMinutes / 60) * 10) / 10; // Return hours with 1 decimal
  },

  loadFromLocalStorage: () => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem("routineStore");
    if (stored) {
      try {
        const { profile, routine, dailyProgress } = JSON.parse(stored);
        set({
          profile: profile || DEFAULT_PROFILE,
          routine: routine || DEFAULT_ROUTINE,
          dailyProgress: new Map(dailyProgress || []),
        });
      } catch {
        console.error("Failed to load from localStorage");
      }
    }
  },

  saveToLocalStorage: () => {
    if (typeof window === "undefined") return;

    const state = get();
    const toStore = {
      profile: state.profile,
      routine: state.routine,
      dailyProgress: Array.from(state.dailyProgress.entries()),
    };

    localStorage.setItem("routineStore", JSON.stringify(toStore));
  },
}));