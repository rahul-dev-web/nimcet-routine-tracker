"use client";

import { BarChart3, Settings, Home, ListTodo } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/routine", label: "Routine", icon: ListTodo },
    { href: "/progress", label: "Progress", icon: BarChart3 },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-effect border-t border-slate-200 dark:border-slate-700 px-4 py-3 md:relative md:border-t-0 md:border-r md:px-0 md:py-6 shadow-sm">
      <div className="flex justify-around md:flex-col md:space-y-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col md:flex-row items-center justify-center md:justify-start gap-2 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-blue-500 text-white shadow-lg"
                  : "text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Icon size={24} />
              <span className="text-xs md:text-sm font-medium hidden md:inline">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
