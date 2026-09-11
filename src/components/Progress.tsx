"use client";

import { useRoutineStore } from "@/store/routineStore";
import { TrendingUp, Clock, Zap } from "lucide-react";
import { formatDateKey, getTodayDateKey } from "@/lib/routineBuilder";

export function Progress() {
  const today = getTodayDateKey();
  const routine = useRoutineStore((state) => state.getRoutineForDate(today));
  const calculateStudyHours = useRoutineStore((state) => state.calculateStudyHours);
  const dailyProgress = useRoutineStore((state) => state.getDailyProgress(today));
  const targetHours = useRoutineStore((state) => state.profile.studyTargetHours);
  const todayStudyHours = calculateStudyHours(today);
  const studyTasks = routine.filter((t) => t.category === "study");
  const completedStudyTasks = dailyProgress?.tasks.filter((t) => t.completed && studyTasks.some((st) => st.id === t.taskId)).length || 0;

  const getStreak = (): number => {
    let streak = 0;
    const date = new Date();
    const minimumStudyHours = targetHours * 0.7;

    for (let i = 0; i < 365; i++) {
      const dateStr = formatDateKey(date);
      const progress = useRoutineStore.getState().getDailyProgress(dateStr);
      const completedStudyHours = useRoutineStore.getState().calculateStudyHours(dateStr);

      if (progress && completedStudyHours >= minimumStudyHours) {
        streak++;
      } else if (i > 0) {
        break;
      }
      date.setDate(date.getDate() - 1);
    }
    return streak;
  };

  const streak = getStreak();
  const progressPercent = dailyProgress && routine.length
    ? Math.round((dailyProgress.completedTasks / routine.length) * 100)
    : 0;
  const studyTargetPercent = Math.min(Math.round((todayStudyHours / targetHours) * 100), 100);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-effect p-6 rounded-2xl border border-slate-200 bg-slate-50 shadow-sm dark:border-slate-700 dark:bg-slate-900/95">
          <div className="flex items-center justify-between mb-4"><p className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase">Task progress</p><TrendingUp size={20} className="text-blue-600" /></div>
          <p className="text-5xl font-bold text-blue-600 mb-2">{progressPercent}%</p>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3"><div className="bg-blue-500 h-full rounded-full transition-all" style={{ width: `${progressPercent}%` }} /></div>
          <p className="text-xs text-slate-700 dark:text-slate-400 mt-2">{dailyProgress?.completedTasks || 0} / {routine.length} tasks completed</p>
        </div>

        <div className="glass-effect p-6 rounded-2xl border border-slate-200 bg-slate-50 shadow-sm dark:border-slate-700 dark:bg-slate-900/95">
          <div className="flex items-center justify-between mb-4"><p className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase">Completed study time</p><Clock size={20} className="text-orange-600" /></div>
          <p className="text-5xl font-bold text-orange-600 mb-2">{todayStudyHours}h</p>
          <p className="text-xs text-slate-700 dark:text-slate-400">Target: {targetHours} hours</p>
          <div className="mt-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2"><div className="bg-orange-500 h-full rounded-full transition-all" style={{ width: `${studyTargetPercent}%` }} /></div>
        </div>

        <div className="glass-effect p-6 rounded-2xl border border-slate-200 bg-slate-50 shadow-sm dark:border-slate-700 dark:bg-slate-900/95">
          <div className="flex items-center justify-between mb-4"><p className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase">Study tasks</p><Zap size={20} className="text-yellow-600" /></div>
          <p className="text-5xl font-bold text-yellow-600 mb-2">{completedStudyTasks}/{studyTasks.length}</p>
          <p className="text-xs text-slate-700 dark:text-slate-400">Study tasks completed</p>
        </div>

        <div className="glass-effect p-6 rounded-2xl border border-slate-200 bg-slate-50 shadow-sm dark:border-slate-700 dark:bg-slate-900/95">
          <div className="flex items-center justify-between mb-4"><p className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase">Study streak 🔥</p><span className="text-3xl">🔥</span></div>
          <p className="text-5xl font-bold text-red-600 mb-2">{streak}</p>
          <p className="text-xs text-slate-700 dark:text-slate-400">days with ≥70% of study target</p>
        </div>
      </div>

      <div className="glass-effect p-6 rounded-2xl border border-slate-200 bg-slate-50 shadow-sm dark:border-slate-700 dark:bg-slate-900/95">
        <p className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Task breakdown</p>
        <div className="space-y-4">
          {[
            { category: "study", label: "📖 Study", color: "blue" },
            { category: "break", label: "☕ Break", color: "green" },
            { category: "exercise", label: "💪 Exercise", color: "red" },
            { category: "other", label: "🔔 Other", color: "gray" },
          ].map(({ category, label, color }) => {
            const categoryTasks = routine.filter((t) => t.category === category);
            const completedInCategory = dailyProgress?.tasks.filter((t) => t.completed && categoryTasks.some((ct) => ct.id === t.taskId)).length || 0;
            const percent = categoryTasks.length ? Math.round((completedInCategory / categoryTasks.length) * 100) : 0;
            const colorMap = { blue: "bg-blue-500", green: "bg-green-500", red: "bg-red-500", gray: "bg-gray-500" };
            return (
              <div key={category}>
                <div className="flex items-center justify-between mb-2"><span className="font-medium text-slate-800 dark:text-slate-300">{label}</span><span className="text-sm font-semibold text-slate-700 dark:text-slate-400">{completedInCategory}/{categoryTasks.length} ({percent}%)</span></div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5"><div className={`${colorMap[color as keyof typeof colorMap]} h-full rounded-full transition-all`} style={{ width: `${percent}%` }} /></div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass-effect p-6 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm dark:bg-slate-950 dark:border-slate-700">
        <p className="font-semibold text-blue-900 dark:text-blue-100 mb-3">💡 Better progress rule</p>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li>✓ Your study target is {targetHours} hours.</li>
          <li>✓ A study day counts toward your streak at 70%+ of target.</li>
          <li>✓ Completing the whole timetable is useful, but missed breaks no longer destroy the streak.</li>
          <li>✓ “Completed study time” is based on the scheduled duration of completed study blocks.</li>
        </ul>
      </div>
    </div>
  );
}
