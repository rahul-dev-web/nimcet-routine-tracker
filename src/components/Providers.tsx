"use client";

import { useEffect, useState } from "react";
import { useRoutineStore } from "@/store/routineStore";
import {
  COLLEGE_QUESTION_DEADLINE,
  getTodayDateKey,
} from "@/lib/routineBuilder";

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const loadFromLocalStorage = useRoutineStore((state) => state.loadFromLocalStorage);
  const resolvePendingCollegePlans = useRoutineStore((state) => state.resolvePendingCollegePlans);

  useEffect(() => {
    loadFromLocalStorage();

    const tick = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      useRoutineStore.setState({ currentTime: timeStr });
      resolvePendingCollegePlans();
    };

    tick();
    const timer = setInterval(tick, 30000);

    setMounted(true);

    return () => clearInterval(timer);
  }, [loadFromLocalStorage, resolvePendingCollegePlans]);

  if (!mounted) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return <>{children}</>;
}

export function useTodayKey() {
  return getTodayDateKey();
}

export { COLLEGE_QUESTION_DEADLINE };
