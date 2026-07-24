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
      {/* Profile Settings */}
      <div className="glass-effect p-6 rounded-2xl">
        <p className="text-lg font-semibold mb-6 text-gray-800 dark:text-gray-100">👤 प्रोफाइल</p>

        <div className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              नाम
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Wake Up Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                सुबह उठने का समय
              </label>
              <input
                type="time"
                name="wakeUpTime"
                value={formData.wakeUpTime}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Sleep Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                सोने का समय
              </label>
              <input
                type="time"
                name="sleepTime"
                value={formData.sleepTime}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Study Target */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              दैनिक पढ़ाई का लक्ष्य (घंटे)
            </label>
            <input
              type="number"
              name="studyTargetHours"
              value={formData.studyTargetHours}
              onChange={handleInputChange}
              min="1"
              max="16"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Theme */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              थीम
            </label>
            <select
              name="theme"
              value={formData.theme}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="light">☀️ हल्का</option>
              <option value="dark">🌙 गहरा</option>
              <option value="system">🖥️ सिस्टम</option>
            </select>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className={`w-full mt-6 px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
            saved
              ? "bg-green-500 text-white"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          <Save size={20} />
          {saved ? "✓ सहेजा गया!" : "सेटिंग्स सहेजो"}
        </button>
      </div>

      {/* Quick Info */}
      <div className="glass-effect p-6 rounded-2xl">
        <p className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">ℹ️ जानकारी</p>
        
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <p>
            <strong>संस्करण:</strong> NIMCET Routine Tracker v1.0.0
          </p>
          <p>
            <strong>स्टोरेज:</strong> सभी डेटा स्थानीय रूप से आपके डिवाइस पर संरक्षित है
          </p>
          <p>
            <strong>अपडेट:</strong> Phase 1A (MVP) पूर्ण - अगले Phase के लिए तैयार
          </p>
          <p className="pt-3 border-t border-gray-300 dark:border-gray-600">
            🚀 आपके NIMCET लक्ष्य को प्राप्त करने के लिए शुभकामनाएं!
          </p>
        </div>
      </div>

      {/* Data Management */}
      <div className="glass-effect p-6 rounded-2xl border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
        <p className="text-lg font-semibold mb-4 text-orange-900 dark:text-orange-100">⚠️ डेटा प्रबंधन</p>
        
        <button
          onClick={() => {
            if (confirm("क्या आप सभी डेटा साफ़ करना चाहते हैं? यह क्रिया पूरी तरह से अपरिवर्तनीय है।")) {
              localStorage.clear();
              window.location.reload();
            }
          }}
          className="w-full px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition"
        >
          सभी डेटा साफ़ करो
        </button>
      </div>
    </div>
  );
}