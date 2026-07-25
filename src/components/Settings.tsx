"use client";

import { useRoutineStore } from "@/store/routineStore";
import { Save } from "lucide-react";
import { useState } from "react";

export function Settings() {
  const profile = useRoutineStore((state) => state.profile);
  const setProfile = useRoutineStore((state) => state.setProfile);

  const [formData, setFormData] = useState(profile);
  const [saved, setSaved] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "studyTargetHours" ? parseInt(value) : value,
    }));
    setSaved(false);
  };

  const handleSave = () => {
    setProfile(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="glass-effect p-6 rounded-2xl border border-slate-200 bg-slate-50 shadow-sm dark:border-slate-700 dark:bg-slate-900/95">
        <p className="text-lg font-semibold mb-6 text-slate-900 dark:text-slate-100">👤 Profile</p>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Wake-up time
              </label>
              <input
                type="time"
                name="wakeUpTime"
                value={formData.wakeUpTime}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Sleep time
              </label>
              <input
                type="time"
                name="sleepTime"
                value={formData.sleepTime}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Daily study target (hours)
            </label>
            <input
              type="number"
              name="studyTargetHours"
              value={formData.studyTargetHours}
              onChange={handleInputChange}
              min="1"
              max="16"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Theme
            </label>
            <select
              name="theme"
              value={formData.theme}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="light">☀️ Light</option>
              <option value="dark">🌙 Dark</option>
              <option value="system">🖥️ System</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleSave}
          className={`w-full mt-6 px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
            saved
              ? "bg-green-500 text-white"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          <Save size={20} />
          {saved ? "✓ Saved!" : "Save settings"}
        </button>
      </div>

      <div className="glass-effect p-6 rounded-2xl border border-slate-200 bg-slate-50 shadow-sm dark:border-slate-700 dark:bg-slate-900/95">
        <p className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">ℹ️ Information</p>

        <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
          <p>
            <strong>Version:</strong> NIMCET Routine Tracker v1.0.0
          </p>
          <p>
            <strong>Storage:</strong> All data is stored locally on your device
          </p>
          <p>
            <strong>Update:</strong> Phase 1A (MVP) complete and ready for the next phase
          </p>
          <p className="pt-3 border-t border-slate-300 dark:border-slate-600">
            🚀 Wishing you the best as you work toward your NIMCET goal!
          </p>
        </div>
      </div>

      <div className="glass-effect p-6 rounded-2xl border border-orange-200 bg-orange-50 shadow-sm dark:border-orange-800 dark:bg-orange-950/80">
        <p className="text-lg font-semibold mb-4 text-orange-900 dark:text-orange-100">⚠️ Data management</p>

        <button
          onClick={() => {
            if (confirm("Do you want to clear all data? This action is irreversible.")) {
              localStorage.clear();
              window.location.reload();
            }
          }}
          className="w-full px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition"
        >
          Clear all data
        </button>
      </div>
    </div>
  );
}