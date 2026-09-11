"use client";

import { useRoutineStore } from "@/store/routineStore";
import { Download, Save, Upload } from "lucide-react";
import { useRef, useState } from "react";

export function Settings() {
  const profile = useRoutineStore((state) => state.profile);
  const setProfile = useRoutineStore((state) => state.setProfile);
  const loadFromLocalStorage = useRoutineStore((state) => state.loadFromLocalStorage);
  const [formData, setFormData] = useState(profile);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === "studyTargetHours" ? Number(value) : value }));
    setSaved(false);
  };

  const handleSave = () => {
    setProfile(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const exportData = () => {
    const data = localStorage.getItem("routineStore") || "{}";
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `nimcet-routine-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (!parsed || typeof parsed !== "object" || !parsed.profile || !Array.isArray(parsed.dailyPlans) || !Array.isArray(parsed.dailyProgress)) {
        throw new Error("Invalid backup");
      }
      localStorage.setItem("routineStore", JSON.stringify(parsed));
      loadFromLocalStorage();
      setFormData(useRoutineStore.getState().profile);
      alert("Backup imported successfully.");
    } catch {
      alert("Could not import this file. Please select a valid NIMCET Routine Tracker backup.");
    } finally {
      event.target.value = "";
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="glass-effect p-6 rounded-2xl border border-slate-200 bg-slate-50 shadow-sm dark:border-slate-700 dark:bg-slate-900/95">
        <p className="text-lg font-semibold mb-6 text-slate-900 dark:text-slate-100">👤 Profile</p>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Wake-up time</label>
              <input type="time" name="wakeUpTime" value={formData.wakeUpTime} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Sleep time</label>
              <input type="time" name="sleepTime" value={formData.sleepTime} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Daily study target (hours)</label>
            <input type="number" name="studyTargetHours" value={formData.studyTargetHours} onChange={handleInputChange} min="1" max="16" step="1" className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <p className="text-xs mt-2 text-slate-500 dark:text-slate-400">The routine now scales study blocks to this target.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Theme</label>
            <select name="theme" value={formData.theme} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="light">☀️ Light</option><option value="dark">🌙 Dark</option><option value="system">🖥️ System</option>
            </select>
          </div>
        </div>
        <button onClick={handleSave} className={`w-full mt-6 px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${saved ? "bg-green-500 text-white" : "bg-blue-500 text-white hover:bg-blue-600"}`}><Save size={20} />{saved ? "✓ Saved!" : "Save settings"}</button>
      </div>

      <div className="glass-effect p-6 rounded-2xl border border-slate-200 bg-slate-50 shadow-sm dark:border-slate-700 dark:bg-slate-900/95">
        <p className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">💾 Backup & restore</p>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">Your tracker is local-first. Export a backup before changing devices or clearing browser data.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button onClick={exportData} className="px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 font-semibold flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800"><Download size={18} /> Export backup</button>
          <button onClick={() => fileInputRef.current?.click()} className="px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 font-semibold flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800"><Upload size={18} /> Import backup</button>
          <input ref={fileInputRef} type="file" accept="application/json,.json" onChange={importData} className="hidden" />
        </div>
      </div>

      <div className="glass-effect p-6 rounded-2xl border border-slate-200 bg-slate-50 shadow-sm dark:border-slate-700 dark:bg-slate-900/95">
        <p className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">ℹ️ Information</p>
        <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
          <p><strong>Version:</strong> NIMCET Routine Tracker v1.1.0</p>
          <p><strong>Storage:</strong> All data is stored locally on your device</p>
          <p><strong>Routine:</strong> Wake-up, sleep and study-target settings now affect generated routines</p>
          <p className="pt-3 border-t border-slate-300 dark:border-slate-600">🎯 NIMCET target date: 1 June 2027</p>
        </div>
      </div>

      <div className="glass-effect p-6 rounded-xl border border-orange-200 bg-orange-50 shadow-sm dark:border-orange-800 dark:bg-orange-950/80">
        <p className="text-lg font-semibold mb-4 text-orange-900 dark:text-orange-100">⚠️ Data management</p>
        <button onClick={() => { if (confirm("Do you want to clear all data? This action is irreversible. Export a backup first if needed.")) { localStorage.clear(); window.location.reload(); } }} className="w-full px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition">Clear all data</button>
      </div>
    </div>
  );
}
