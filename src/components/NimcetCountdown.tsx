"use client";

import { useEffect, useState } from "react";

export const NIMCET_TARGET_DATE = "2027-06-01";

function getDaysRemaining(): number {
  const now = new Date();
  const todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const targetUtc = Date.UTC(2027, 5, 1);
  return Math.max(0, Math.ceil((targetUtc - todayUtc) / (24 * 60 * 60 * 1000)));
}

export function NimcetCountdown() {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    const update = () => setDays(getDaysRemaining());
    update();
    const interval = window.setInterval(update, 60 * 1000);
    return () => window.clearInterval(interval);
  }, []);

  const targetReached = days === 0;

  return (
    <div className="glass-effect p-6 rounded-2xl border border-blue-200 bg-blue-50 shadow-sm dark:border-blue-900 dark:bg-blue-950/40">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">🎯 NIMCET 2027 countdown</p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Target date: 1 June 2027</p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-4xl sm:text-5xl font-black text-blue-700 dark:text-blue-300 tabular-nums">
            {days === null ? "—" : days}
          </p>
          <p className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-400">
            {targetReached ? "Target date" : days === 1 ? "day remaining" : "days remaining"}
          </p>
        </div>
      </div>
      <div className="mt-4 h-2 rounded-full bg-blue-100 dark:bg-blue-900/60 overflow-hidden">
        <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${days === null ? 0 : Math.max(3, Math.min(100, (days / 365) * 100))}%` }} />
      </div>
      <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">Every day counts. Focus on today’s PYQs, tests and revision.</p>
    </div>
  );
}
