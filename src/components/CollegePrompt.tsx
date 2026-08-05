"use client";

import { useRoutineStore } from "@/store/routineStore";
import {
  COLLEGE_QUESTION_DEADLINE,
  getTodayDateKey,
  isCollegeQuestionOpen,
} from "@/lib/routineBuilder";
import { GraduationCap, Home } from "lucide-react";

export function CollegePrompt() {
  const today = getTodayDateKey();
  const dayPlan = useRoutineStore((state) => state.getDayPlan(today));
  const setCollegePlan = useRoutineStore((state) => state.setCollegePlan);

  if (dayPlan?.college !== "pending") {
    return null;
  }

  const open = isCollegeQuestionOpen();

  return (
    <div
      className={`glass-effect p-6 rounded-2xl border shadow-sm ${
        open
          ? "border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/80"
          : "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/80"
      }`}
    >
      <p className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
        🎓 Aaj college jaa rahe ho?
      </p>
      <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
        {open
          ? `${COLLEGE_QUESTION_DEADLINE} tak jawab do — uske baad automatically “college nahi” wala routine chalega.`
          : "9 AM ho chuka hai — ab “college nahi” routine default hai jab tak aap khud change na karein."}
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={() => setCollegePlan(today, true)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
        >
          <GraduationCap size={20} />
          Haan, college jaa raha hoon
        </button>
        <button
          type="button"
          onClick={() => setCollegePlan(today, false)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 text-white font-semibold hover:bg-slate-900 transition dark:bg-slate-700 dark:hover:bg-slate-600"
        >
          <Home size={20} />
          Nahi, ghar pe padhai
        </button>
      </div>
    </div>
  );
}
