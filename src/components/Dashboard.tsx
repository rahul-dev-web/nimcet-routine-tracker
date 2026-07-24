"use client";

import { useEffect, useState } from "react";
import { useRoutineStore } from "@/store/routineStore";
import { Clock, ChevronRight, TrendingUp } from "lucide-react";

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
        setGreeting("🌅 सुप्रभात");
      } else if (hour < 17) {
        setGreeting("☀️ दोपहर को");
      } else if (hour < 21) {
        setGreeting("🌆 शाम को");
      } else {
        setGreeting("🌙 रात को");
      }

      setTime(now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false }));
      setDate(now.toLocaleDateString("hi-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }));
    };

    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const progressPercent = dailyProgress ? Math.round((dailyProgress.completedTasks / dailyProgress.totalTasks) * 100) : 0;
  const studyHours = calculateStudyHours(new Date().toISOString().split("T")[0]);

  return (
    <div className="space-y-6">
      {/* Greeting Section */}
      <div className="glass-effect p-6 rounded-2xl">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">{greeting}, {profile.name}!</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">{date}</p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold text-blue-500 flex items-center gap-2">
              <Clock size={40} />
              {time}
            </div>
            <p className="text-sm text-gray-500 mt-2">सही समय पर, हर दिन</p>
          </div>
        </div>
      </div>

      {/* Current & Next Task Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Current Task */}
        <div className="glass-effect p-6 rounded-2xl border-2 border-blue-400 bg-blue-50 dark:bg-blue-900/30">
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase mb-2">🎯 अभी करो</p>
          <div className="mb-4">
            <p className="text-2xl font-bold mb-2">{currentTask?.title || "सब पूरा हो गया!"}</p>
            {currentTask && (
              <div className="flex items-center gap-4 text-sm text-gray-700 dark:text-gray-300">
                <span className="bg-white dark:bg-gray-800 px-3 py-1 rounded-full font-mono">
                  {currentTask.startTime} - {currentTask.endTime}
                </span>
                <span className="text-gray-500 dark:text-gray-400">{currentTask.duration} मिनट</span>
              </div>
            )}
          </div>
          {currentTask?.category === "study" && (
            <div className="flex items-center gap-2 text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-3 py-2 rounded-lg">
              <span>📖 Study Time</span>
            </div>
          )}
        </div>

        {/* Next Task */}
        <div className="glass-effect p-6 rounded-2xl">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">➡️ अगला काम</p>
          <div className="mb-4">
            <p className="text-2xl font-bold mb-2">{nextTask?.title || "आराम का समय"}</p>
            {nextTask && (
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full font-mono">
                  {nextTask.startTime}
                </span>
                <span className="text-gray-500 dark:text-gray-500">{nextTask.duration} मिनट</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress & Study Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Progress */}
        <div className="glass-effect p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase">📊 आज की प्रगति</p>
            <TrendingUp size={20} className="text-green-500" />
          </div>
          <div className="mb-4">
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-3xl font-bold text-blue-500">{progressPercent}%</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {dailyProgress?.completedTasks || 0} / {routine.length} कार्य
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">लक्ष्य: हर दिन 100% पूरा करो</div>
        </div>

        {/* Study Hours */}
        <div className="glass-effect p-6 rounded-2xl">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase mb-4">⏱️ आज की पढ़ाई</p>
          <div className="mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-orange-500">{studyHours}</span>
              <span className="text-lg text-gray-500 dark:text-gray-400">घंटे</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              लक्ष्य: {profile.studyTargetHours} घंटे
            </p>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-orange-400 h-full rounded-full"
              style={{ width: `${Math.min((studyHours / profile.studyTargetHours) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Action */}
      <div className="glass-effect p-6 rounded-2xl text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {currentTask
            ? `🎯 अभी ${currentTask.title} कर रहे हो`
            : "✅ सभी कार्य पूरे हो गए! अब आराम करो।"}
        </p>
      </div>
    </div>
  );
}