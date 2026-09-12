"use client";

import { useEffect, useState } from "react";
import { useRoutineStore } from "@/store/routineStore";
import { Clock, TrendingUp, Target } from "lucide-react";
import { CollegePrompt } from "@/components/CollegePrompt";
import { NimcetCountdown } from "@/components/NimcetCountdown";
import { getTodayDateKey } from "@/lib/routineBuilder";
import { accuracyOf } from "@/lib/nimcetTrackerMetrics";
import { useNimcetStore } from "@/store/nimcetStore";
import Link from "next/link";

export function Dashboard() {
  const [time, setTime] = useState("");
  const [greeting, setGreeting] = useState("");
  const [date, setDate] = useState("");
  const today = getTodayDateKey();
  const profile = useRoutineStore((state) => state.profile);
  const dayPlan = useRoutineStore((state) => state.getDayPlan(today));
  const currentTask = useRoutineStore((state) => state.getCurrentTask(today));
  const nextTask = useRoutineStore((state) => state.getNextTask(today));
  const routine = useRoutineStore((state) => state.getRoutineForDate(today));
  const dailyProgress = useRoutineStore((state) => state.getDailyProgress(today));
  const calculateStudyHours = useRoutineStore((state) => state.calculateStudyHours);
  const dpps = useNimcetStore((state) => state.dpps);
  const dailyTopics = useNimcetStore((state) => state.dailyTopics);
  const mocks = useNimcetStore((state) => state.assessments.filter((record) => record.type === "mock"));
  const loadNimcet = useNimcetStore((state) => state.load);

  useEffect(() => {
    loadNimcet();
  }, [loadNimcet]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hour = now.getHours();
      setGreeting(hour < 12 ? "🌅 Good morning" : hour < 17 ? "☀️ Good afternoon" : hour < 21 ? "🌆 Good evening" : "🌙 Good night");
      setTime(now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }));
      setDate(now.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const progressPercent = dailyProgress && routine.length ? Math.round((dailyProgress.completedTasks / routine.length) * 100) : 0;
  const studyHours = calculateStudyHours(today);
  const studyTargetPercent = Math.min((studyHours / profile.studyTargetHours) * 100, 100);
  const planLabel = dayPlan.college === "going"
    ? "🎓 Aaj college day routine"
    : dayPlan.college === "not_going"
      ? dayPlan.autoDefaulted ? "🏠 Ghar wala routine (9 AM ke baad auto-default)" : "🏠 Ghar pe padhai wala routine"
      : "⏳ Subah 9 AM tak college ka jawab do";
  const todayDpp = dpps.find((record) => record.date === today);
  const todayTopics = dailyTopics[today]?.topicIds.length ?? 0;
  const latestMock = mocks.slice().sort((a, b) => b.date.localeCompare(a.date))[0];

  return (
    <div className="space-y-6">
      <CollegePrompt />
      <div className="glass-effect p-6 rounded-2xl border border-slate-200 bg-slate-50 shadow-sm dark:border-slate-700 dark:bg-slate-900/95">
        <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-start">
          <div><h1 className="text-3xl sm:text-4xl font-bold mb-2 text-slate-900 dark:text-slate-100">{greeting}, {profile.name}!</h1><p className="text-lg text-slate-700 dark:text-slate-400">{date}</p><p className="text-sm mt-2 text-blue-700 dark:text-blue-300 font-medium">{planLabel}</p></div>
          <div className="text-left md:text-right"><div className="text-4xl sm:text-5xl font-bold text-blue-600 flex items-center gap-2"><Clock size={38} />{time}</div><p className="text-sm text-slate-700 dark:text-slate-400 mt-2">On time, every day</p></div>
        </div>
      </div>

      <NimcetCountdown />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-effect p-6 rounded-2xl border border-slate-300 bg-slate-950 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm font-semibold text-cyan-200 uppercase mb-2">🎯 Do this now</p>
          <p className="text-2xl font-bold mb-2 text-slate-100">{currentTask?.title || "You’re all caught up!"}</p>
          {currentTask && <div className="flex flex-wrap items-center gap-3 text-sm text-slate-200"><span className="bg-slate-800/90 text-slate-100 px-3 py-1 rounded-full font-mono">{currentTask.startTime} - {currentTask.endTime}</span><span className="text-slate-300">{currentTask.duration} minutes</span></div>}
          {currentTask?.category === "study" && <div className="inline-flex mt-4 text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-3 py-2 rounded-lg">📖 Study time</div>}
        </div>
        <div className="glass-effect p-6 rounded-2xl border border-slate-200 bg-slate-50 shadow-sm dark:border-slate-700 dark:bg-slate-950/95">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-300 uppercase mb-2">➡️ Next up</p>
          <p className="text-2xl font-bold mb-2 text-slate-900 dark:text-slate-100">{nextTask?.title || "Time to relax"}</p>
          {nextTask && <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700 dark:text-slate-300"><span className="bg-slate-900/95 text-slate-100 px-3 py-1 rounded-full font-mono">{nextTask.startTime}</span><span>{nextTask.duration} minutes</span></div>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-effect p-6 rounded-2xl border border-slate-200 bg-slate-50 shadow-sm dark:border-slate-700 dark:bg-slate-950/95">
          <div className="flex items-center justify-between mb-4"><p className="text-sm font-semibold text-slate-800 dark:text-slate-300 uppercase">📊 Today’s task progress</p><TrendingUp size={20} className="text-green-600" /></div>
          <div className="mb-4"><div className="flex justify-between items-baseline mb-2"><span className="text-3xl font-bold text-blue-700">{progressPercent}%</span><span className="text-sm text-slate-700 dark:text-slate-400">{dailyProgress?.completedTasks || 0} / {routine.length} tasks</span></div><div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden"><div className="bg-blue-500 h-full rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }} /></div></div>
          <div className="text-xs text-slate-700 dark:text-slate-400">Task completion is useful; your study target is the main goal.</div>
        </div>
        <div className="glass-effect p-6 rounded-2xl border border-slate-200 bg-slate-50 shadow-sm dark:border-slate-700 dark:bg-slate-950/95">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-300 uppercase mb-4">⏱️ Completed study time today</p>
          <div className="mb-4"><div className="flex items-baseline gap-2"><span className="text-4xl font-bold text-orange-600">{studyHours}</span><span className="text-lg text-slate-700 dark:text-slate-400">hours</span></div><p className="text-xs text-slate-700 dark:text-slate-400 mt-2">Target: {profile.studyTargetHours} hours</p></div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2"><div className="bg-orange-400 h-full rounded-full" style={{ width: `${studyTargetPercent}%` }} /></div>
        </div>
      </div>

      <section className="glass-effect rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-950/95">
        <div className="mb-4 flex items-center justify-between gap-3"><div><p className="text-sm font-semibold uppercase text-slate-800 dark:text-slate-300">🎯 NIMCET practice</p><p className="text-xs opacity-60">Preparation progress stays separate from routine task completion.</p></div><Link href="/nimcet" className="rounded-lg border px-3 py-2 text-sm font-semibold">Open tracker</Link></div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border p-4"><p className="text-xs opacity-60">Today’s topics</p><p className="mt-1 text-2xl font-bold">{todayTopics}</p></div>
          <div className="rounded-xl border p-4"><p className="text-xs opacity-60">Today’s DPP</p><p className="mt-1 text-2xl font-bold">{todayDpp ? `${accuracyOf(todayDpp.correct, todayDpp.wrong)}%` : "Not done"}</p>{todayDpp && <p className="text-xs opacity-60">{todayDpp.correct}/{todayDpp.questionCount} correct</p>}</div>
          <div className="rounded-xl border p-4"><p className="text-xs opacity-60">Latest unit mock</p><p className="mt-1 flex items-center gap-2 text-2xl font-bold"><Target size={22} />{latestMock ? `${accuracyOf(latestMock.correct, latestMock.wrong)}%` : "—"}</p>{latestMock && <p className="truncate text-xs opacity-60">{latestMock.unitTitle}</p>}</div>
        </div>
      </section>

      <div className="glass-effect p-6 rounded-2xl border border-slate-200 bg-slate-100 text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 text-center shadow-sm"><p>{currentTask ? `🎯 You’re working on ${currentTask.title} right now` : "✅ No unfinished task is scheduled right now."}</p></div>
    </div>
  );
}
