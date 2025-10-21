"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Menu, X } from "lucide-react";
import { Button } from "../ui/Button";

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

export function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white dark:bg-gray-800 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700 lg:hidden">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Pharmacy Management
          </h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="p-2"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <Sidebar onNavigate={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header with menu button */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 lg:hidden">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="p-2"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              Pharmacy Management
            </h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </div>

        {/* Desktop header */}
        <div className="hidden lg:block">
          <Header />
        </div>

        {/* Main content area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
