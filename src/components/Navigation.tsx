"use client";

import { BarChart3, Settings, Home, ListTodo } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "डैशबोर्ड", icon: Home },
    { href: "/routine", label: "रूटीन", icon: ListTodo },
    { href: "/progress", label: "प्रगति", icon: BarChart3 },
    { href: "/settings", label: "सेटिंग्स", icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-effect border-t border-gray-200 dark:border-gray-700 px-4 py-3 md:relative md:border-t-0 md:border-r md:px-0 md:py-6">
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
                  : "text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Icon size={24} />
              <span className="text-xs md:text-sm font-medium hidden xs:inline">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}