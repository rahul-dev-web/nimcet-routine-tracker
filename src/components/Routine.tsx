"use client";

import { useState } from "react";
import { useRoutineStore } from "@/store/routineStore";
import { CheckCircle2, Circle, Clock, Target } from "lucide-react";
import { motion } from "framer-motion";
import { getTodayDateKey } from "@/lib/routineBuilder";

export function Routine() {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateKey());

  const routine = useRoutineStore((state) => state.getRoutineForDate(selectedDate));
  const dayPlan = useRoutineStore((state) => state.getDayPlan(selectedDate));
  const setCollegePlan = useRoutineStore((state) => state.setCollegePlan);
  const currentTask = useRoutineStore((state) => state.getCurrentTask(selectedDate));
  const toggleTaskCompletion = useRoutineStore((state) => state.toggleTaskCompletion);
  const dailyProgress = useRoutineStore((state) => state.getDailyProgress(selectedDate));

  const today = getTodayDateKey();
  const isToday = selectedDate === today;

  const groupedTasks = routine.reduce(
    (acc, task) => {
      if (!acc[task.category]) {
        acc[task.category] = [];
      }
      acc[task.category].push(task);
      return acc;
    },
    {} as Record<string, typeof routine>
  );

  const categoryLabels = {
    study: { label: "📖 Study", color: "blue" },
    break: { label: "☕ Break", color: "green" },
    exercise: { label: "💪 Exercise", color: "red" },
    other: { label: "🔔 Other", color: "gray" },
  };

  const getTaskStatus = (taskId: string) => {
    if (!dailyProgress) return false;
    return dailyProgress.tasks.find((t) => t.taskId === taskId)?.completed || false;
  };

  const handleToggleTask = (taskId: string) => {
    toggleTaskCompletion(taskId, selectedDate);
  };

  const handleDateChange = (offset: number) => {
    const date = new Date(`${selectedDate}T12:00:00`);
    date.setDate(date.getDate() + offset);
    setSelectedDate(date.toLocaleDateString("en-CA"));
  };

  return (
    <div className="space-y-6">
      <div className="glass-effect p-6 rounded-2xl border border-slate-200 bg-slate-50 shadow-sm dark:border-slate-700 dark:bg-slate-900/95">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => handleDateChange(-1)}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
          >
            ◀
          </button>

          <div className="flex-1 text-center">
            <p className="text-sm text-slate-700 dark:text-slate-300 uppercase font-semibold mb-1">Date</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {new Date(`${selectedDate}T12:00:00`).toLocaleDateString("en-US", {
                weekday: "long",
                day: "numeric",
                month: "short",
              })}
            </p>
            {isToday && <p className="text-xs text-blue-500 font-semibold mt-1">Today</p>}
          </div>

          <button
            onClick={() => handleDateChange(1)}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
          >
            ▶
          </button>
        </div>
      </div>

      <div className="glass-effect p-4 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900/95">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Aaj ka plan</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={() => setCollegePlan(selectedDate, true)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              dayPlan.college === "going"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            }`}
          >
            College jaa raha hoon
          </button>
          <button
            type="button"
            onClick={() => setCollegePlan(selectedDate, false)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              dayPlan.college === "not_going" || dayPlan.college === "pending"
                ? "bg-slate-800 text-white dark:bg-slate-600"
                : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            }`}
          >
            Ghar pe padhai
          </button>
        </div>
      </div>

      <div className="glass-effect p-6 rounded-2xl border border-slate-200 bg-slate-50 shadow-sm dark:border-slate-700 dark:bg-slate-900/95">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-700 dark:text-slate-300 uppercase font-semibold mb-1">Total progress</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {dailyProgress?.completedTasks || 0} / {routine.length}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-700 dark:text-slate-300 uppercase font-semibold mb-1">Percent</p>
            <p className="text-3xl font-bold text-blue-500">
              {dailyProgress ? Math.round((dailyProgress.completedTasks / routine.length) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedTasks).map(([category, tasks]) => (
          <div key={category}>
            <div className="flex items-center gap-2 mb-3">
              <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                {categoryLabels[category as keyof typeof categoryLabels].label}
              </p>
              <span className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded-full">
                {tasks.length}
              </span>
            </div>

            <div className="space-y-3">
              {tasks.map((task, index) => {
                const isCompleted = getTaskStatus(task.id);
                const isCurrent = currentTask?.id === task.id;

                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleToggleTask(task.id)}
                    className={`task-item cursor-pointer ${
                      isCurrent ? "active" : isCompleted ? "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600" : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {isCompleted ? (
                          <CheckCircle2 size={24} className="text-green-500" />
                        ) : (
                          <Circle size={24} className="text-slate-400 dark:text-slate-500" />
                        )}
                      </div>

                      <div className="flex-1">
                        <p className={`font-semibold text-lg ${isCompleted ? "line-through text-slate-500" : "text-slate-800 dark:text-slate-100"}`}>
                          {task.title}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-700 dark:text-slate-400">
                          <div className="flex items-center gap-1">
                            <Clock size={16} />
                            <span className="font-mono">{task.startTime} - {task.endTime}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Target size={16} />
                            <span>{task.duration} minutes</span>
                          </div>
                        </div>
                      </div>

                      {isCurrent && (
                        <div className="flex-shrink-0">
                          <span className="inline-block bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                            In progress
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="glass-effect p-4 rounded-xl text-center text-sm text-slate-700 dark:text-slate-300">
        <p>💡 Tap or click any task to mark it complete</p>
      </div>
    </div>
  );
}
