"use client";

import { useRoutineStore } from "@/store/routineStore";
import { TrendingUp, Calendar, Clock, Zap } from "lucide-react";

export function Progress() {
  const routine = useRoutineStore((state) => state.routine);
  const calculateStudyHours = useRoutineStore((state) => state.calculateStudyHours);
  const dailyProgress = useRoutineStore((state) => {
    const today = new Date().toISOString().split("T")[0];
    return state.getDailyProgress(today);
  });

  const today = new Date().toISOString().split("T")[0];
  const todayStudyHours = calculateStudyHours(today);
  const studyTasks = routine.filter((t) => t.category === "study");
  const completedStudyTasks = dailyProgress?.tasks.filter(
    (t) => t.completed && studyTasks.find((st) => st.id === t.taskId)
  ).length || 0;

  const getStreak = (): number => {
    let streak = 0;
    const date = new Date();
    
    for (let i = 0; i < 30; i++) {
      const dateStr = date.toISOString().split("T")[0];
      const progress = useRoutineStore.getState().getDailyProgress(dateStr);
      
      if (progress && progress.completedTasks === progress.totalTasks) {
        streak++;
      } else if (i > 0) {
        break;
      }
      
      date.setDate(date.getDate() - 1);
    }
    
    return streak;
  };

  const streak = getStreak();
  const progressPercent = dailyProgress
    ? Math.round((dailyProgress.completedTasks / routine.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Today's Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Progress */}
        <div className="glass-effect p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase">कुल प्रगति</p>
            <TrendingUp size={20} className="text-blue-500" />
          </div>
          <p className="text-5xl font-bold text-blue-500 mb-2">{progressPercent}%</p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-blue-500 h-full rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {dailyProgress?.completedTasks || 0} / {routine.length} कार्य पूरे
          </p>
        </div>

        {/* Study Hours */}
        <div className="glass-effect p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase">पढ़ाई का समय</p>
            <Clock size={20} className="text-orange-500" />
          </div>
          <p className="text-5xl font-bold text-orange-500 mb-2">{todayStudyHours}h</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            लक्ष्य: 8 घंटे
          </p>
          <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-orange-500 h-full rounded-full transition-all"
              style={{ width: `${Math.min((todayStudyHours / 8) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Study Tasks */}
        <div className="glass-effect p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase">पढ़ाई के कार्य</p>
            <Zap size={20} className="text-yellow-500" />
          </div>
          <p className="text-5xl font-bold text-yellow-500 mb-2">{completedStudyTasks}/{studyTasks.length}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            पढ़ाई के कार्य पूरे किए
          </p>
        </div>

        {/* Streak */}
        <div className="glass-effect p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase">स्ट्रीक 🔥</p>
            <span className="text-3xl">🔥</span>
          </div>
          <p className="text-5xl font-bold text-red-500 mb-2">{streak}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            लगातार दिन
          </p>
        </div>
      </div>

      {/* Breakdown by Category */}
      <div className="glass-effect p-6 rounded-2xl">
        <p className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">कार्यों का विभाजन</p>
        
        <div className="space-y-4">
          {[
            { category: "study", label: "📖 पढ़ाई", color: "blue" },
            { category: "break", label: "☕ ब्रेक", color: "green" },
            { category: "exercise", label: "💪 व्यायाम", color: "red" },
            { category: "other", label: "🔔 अन्य", color: "gray" },
          ].map(({ category, label, color }) => {
            const categoryTasks = routine.filter((t) => t.category === category);
            const completedInCategory = dailyProgress?.tasks.filter(
              (t) => t.completed && categoryTasks.find((ct) => ct.id === t.taskId)
            ).length || 0;
            const percent = categoryTasks.length > 0 ? Math.round((completedInCategory / categoryTasks.length) * 100) : 0;

            const colorMap = {
              blue: "bg-blue-500",
              green: "bg-green-500",
              red: "bg-red-500",
              gray: "bg-gray-500",
            };

            return (
              <div key={category}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                    {completedInCategory}/{categoryTasks.length} ({percent}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className={`${colorMap[color as keyof typeof colorMap]} h-full rounded-full transition-all`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tips */}
      <div className="glass-effect p-6 rounded-2xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
        <p className="font-semibold text-blue-900 dark:text-blue-100 mb-3">💡 आज के लिए सुझाव</p>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li>✓ हर रोज़ 100% प्रगति का लक्ष्य रखो</li>
          <li>✓ पढ़ाई के 8 घंटे पूरे करने की कोशिश करो</li>
          <li>✓ अपनी स्ट्रीक को तोड़ो मत! 🔥</li>
          <li>✓ नियमित रूप से इसे चेक करो</li>
        </ul>
      </div>
    </div>
  );
}