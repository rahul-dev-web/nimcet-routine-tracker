"use client";

import { useEffect, useState } from "react";
import { useRoutineStore } from "@/store/routineStore";
import { Clock, TrendingUp } from "lucide-react";

export function Dashboard() {
  const [time, setTime] = useState<string>("");
  const [greeting, setGreeting] = useState<string>("");
  const [date, setDate] = useState<string>("");

  const profile = useRoutineStore((state) => state.profile);
  const currentTask = useRoutineStore((state) => state.getCurrentTask());
  const nextTask = useRoutineStore((state) => state.getNextTask());
  const routine = useRoutineStore((state) => state.routine);
  const dailyProgress = useRoutineStore((state) => {
    const today = new Date().toISOString().split("T")[0];
    return state.getDailyProgress(today);
  });
  const calculateStudyHours = useRoutineStore((state) => state.calculateStudyHours);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hour = now.getHours();

      if (hour < 12) {
        setGreeting("🌅 Good morning");
      } else if (hour < 17) {
        setGreeting("☀️ Good afternoon");
      } else if (hour < 21) {
        setGreeting("🌆 Good evening");
      } else {
        setGreeting("🌙 Good night");
      }

      setTime(now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false }));
      setDate(now.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" }));
    };

    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const progressPercent = dailyProgress ? Math.round((dailyProgress.completedTasks / dailyProgress.totalTasks) * 100) : 0;
  const studyHours = calculateStudyHours(new Date().toISOString().split("T")[0]);

  return (
    <div className="space-y-6">
      <div className="glass-effect p-6 rounded-2xl border border-slate-200 bg-slate-50 shadow-sm dark:border-slate-700 dark:bg-slate-900/95">
        <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-start">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-slate-900 dark:text-slate-100">{greeting}, {profile.name}!</h1>
            <p className="text-lg text-slate-700 dark:text-slate-400">{date}</p>
          </div>
          <div className="text-left md:text-right">
            <div className="text-4xl sm:text-5xl font-bold text-blue-600 flex items-center gap-2">
              <Clock size={38} />
              {time}
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-400 mt-2">On time, every day</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-effect p-6 rounded-2xl border border-slate-300 bg-slate-950 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm font-semibold text-cyan-200 uppercase mb-2">🎯 Do this now</p>
          <div className="mb-4">
            <p className="text-2xl font-bold mb-2 text-slate-100">{currentTask?.title || "You’re all caught up!"}</p>
            {currentTask && (
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-200">
                <span className="bg-slate-800/90 text-slate-100 px-3 py-1 rounded-full font-mono shadow-sm">
                  {currentTask.startTime} - {currentTask.endTime}
                </span>
                <span className="text-slate-300">{currentTask.duration} minutes</span>
              </div>
            )}
          </div>
          {currentTask?.category === "study" && (
            <div className="inline-flex items-center gap-2 text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-3 py-2 rounded-lg">
              <span>📖 Study time</span>
            </div>
          )}
        </div>

        <div className="glass-effect p-6 rounded-2xl border border-slate-200 bg-slate-50 shadow-sm dark:border-slate-700 dark:bg-slate-950/95">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-300 uppercase mb-2">➡️ Next up</p>
          <div className="mb-4">
            <p className="text-2xl font-bold mb-2 text-slate-900 dark:text-slate-100">{nextTask?.title || "Time to relax"}</p>
            {nextTask && (
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                <span className="bg-slate-900/95 text-slate-100 px-3 py-1 rounded-full font-mono shadow-sm">
                  {nextTask.startTime}
                </span>
                <span className="text-slate-700 dark:text-slate-400">{nextTask.duration} minutes</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-effect p-6 rounded-2xl border border-slate-200 bg-slate-50 shadow-sm dark:border-slate-700 dark:bg-slate-950/95">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-300 uppercase">📊 Today’s progress</p>
            <TrendingUp size={20} className="text-green-600" />
          </div>
          <div className="mb-4">
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-3xl font-bold text-blue-700">{progressPercent}%</span>
              <span className="text-sm text-slate-700 dark:text-slate-400">
                {dailyProgress?.completedTasks || 0} / {routine.length} tasks
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <div className="text-xs text-slate-700 dark:text-slate-400">Goal: complete 100% every day</div>
        </div>

        <div className="glass-effect p-6 rounded-2xl border border-slate-200 bg-slate-50 shadow-sm dark:border-slate-700 dark:bg-slate-950/95">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-300 uppercase mb-4">⏱️ Study time today</p>
          <div className="mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-orange-600">{studyHours}</span>
              <span className="text-lg text-slate-700 dark:text-slate-400">hours</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-400 mt-2">
              Goal: {profile.studyTargetHours} hours
            </p>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div
              className="bg-orange-400 h-full rounded-full"
              style={{ width: `${Math.min((studyHours / profile.studyTargetHours) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="glass-effect p-6 rounded-2xl border border-slate-200 bg-slate-100 text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 text-center shadow-sm">
        <p className="mb-4">
          {currentTask
            ? `🎯 You’re working on ${currentTask.title} right now`
            : "✅ All tasks are complete! Time to relax."}
        </p>
      </div>
    </div>
  );
}