"use client";

import { useEffect, useState } from "react";
import { useRoutineStore } from "@/store/routineStore";
import { CheckCircle2, Circle, Clock, Target } from "lucide-react";
import { motion } from "framer-motion";

export function Routine() {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);

  const routine = useRoutineStore((state) => state.routine);
  const currentTask = useRoutineStore((state) => state.getCurrentTask());
  const toggleTaskCompletion = useRoutineStore((state) => state.toggleTaskCompletion);
  const dailyProgress = useRoutineStore((state) => state.getDailyProgress(selectedDate));

  // Get today's date for display
  const today = new Date().toISOString().split("T")[0];
  const isToday = selectedDate === today;

  // Group tasks by category
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
    study: { label: "📖 पढ़ाई", color: "blue" },
    break: { label: "☕ ब्रेक", color: "green" },
    exercise: { label: "💪 व्यायाम", color: "red" },
    other: { label: "🔔 अन्य", color: "gray" },
  };

  const getTaskStatus = (taskId: string) => {
    if (!dailyProgress) return false;
    return dailyProgress.tasks.find((t) => t.taskId === taskId)?.completed || false;
  };

  const handleToggleTask = (taskId: string) => {
    toggleTaskCompletion(taskId, selectedDate);
  };

  const handleDateChange = (offset: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + offset);
    setSelectedDate(date.toISOString().split("T")[0]);
  };

  return (
    <div className="space-y-6">
      {/* Date Selector */}
      <div className="glass-effect p-6 rounded-2xl">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => handleDateChange(-1)}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition"
          >
            ◀
          </button>

          <div className="flex-1 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 uppercase font-semibold mb-1">तारीख</p>
            <p className="text-2xl font-bold">
              {new Date(selectedDate).toLocaleDateString("hi-IN", {
                weekday: "long",
                day: "numeric",
                month: "short",
              })}
            </p>
            {isToday && <p className="text-xs text-blue-500 font-semibold mt-1">आज</p>}
          </div>

          <button
            onClick={() => handleDateChange(1)}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition"
          >
            ▶
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="glass-effect p-6 rounded-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 uppercase font-semibold mb-1">कुल प्रगति</p>
            <p className="text-3xl font-bold">
              {dailyProgress?.completedTasks || 0} / {routine.length}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400 uppercase font-semibold mb-1">प्रतिशत</p>
            <p className="text-3xl font-bold text-blue-500">
              {dailyProgress ? Math.round((dailyProgress.completedTasks / routine.length) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Tasks by Category */}
      <div className="space-y-6">
        {Object.entries(groupedTasks).map(([category, tasks]) => (
          <div key={category}>
            <div className="flex items-center gap-2 mb-3">
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                {categoryLabels[category as keyof typeof categoryLabels].label}
              </p>
              <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">
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
                      isCurrent ? "active" : isCompleted ? "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {isCompleted ? (
                          <CheckCircle2 size={24} className="text-green-500" />
                        ) : (
                          <Circle size={24} className="text-gray-400 dark:text-gray-600" />
                        )}
                      </div>

                      <div className="flex-1">
                        <p className={`font-semibold text-lg ${isCompleted ? "line-through text-gray-500" : "text-gray-800 dark:text-gray-100"}`}>
                          {task.title}
                        </p>

                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Clock size={16} />
                            <span className="font-mono">{task.startTime} - {task.endTime}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Target size={16} />
                            <span>{task.duration} मिनट</span>
                          </div>
                        </div>
                      </div>

                      {isCurrent && (
                        <div className="flex-shrink-0">
                          <span className="inline-block bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                            चल रहा है
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

      {/* Footer Note */}
      <div className="glass-effect p-4 rounded-xl text-center text-sm text-gray-600 dark:text-gray-400">
        <p>💡 किसी भी कार्य को दबाओ/क्लिक करो उसे पूरा करने के लिए</p>
      </div>
    </div>
  );
}