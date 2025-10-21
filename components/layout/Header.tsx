"use client";

import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/admin": "Admin Dashboard",
  "/sales": "Sales Management",
  "/inventory": "Inventory Management",
  "/expenses": "Expense Tracking",
  "/hr": "Human Resources",
  "/categories": "Category Management",
};

export function Header() {
  const pathname = usePathname();
  const title = pageTitles[pathname] || "Dashboard";

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        {title}
      </h1>
    </header>
  );
}
