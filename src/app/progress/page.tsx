"use client";

import { Progress } from "@/components/Progress";
import { Navigation } from "@/components/Navigation";

export default function ProgressPage() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {/* Sidebar Navigation (Desktop) */}
      <aside className="hidden md:block w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sticky top-0 h-screen overflow-y-auto">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-500 mb-8">📚 NRT</h1>
          <Navigation />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
        <div className="max-w-4xl mx-auto">
          <Progress />
        </div>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <div className="md:hidden">
        <Navigation />
      </div>
    </div>
  );
}