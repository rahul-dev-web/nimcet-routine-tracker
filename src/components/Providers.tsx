"use client";

import { useEffect, useState } from "react";
import { useRoutineStore } from "@/store/routineStore";

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const loadFromLocalStorage = useRoutineStore((state) => state.loadFromLocalStorage);

  useEffect(() => {
    // Load from localStorage on mount
    loadFromLocalStorage();

    // Update current time every minute
    const timer = setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
      useRoutineStore.setState({ currentTime: timeStr });
    }, 60000);

    setMounted(true);

    return () => clearInterval(timer);
  }, [loadFromLocalStorage]);

  if (!mounted) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return <>{children}</>;
}