import React from "react";
import {
  Briefcase,
  FileText,
  LayoutDashboard,
  MessageSquare,
  UserCircle,
  Search,
  LogOut,
  User,
} from "lucide-react";
import { Page } from "../types";

interface NavigationProps {
  currentPage: Page;
  setPage: (page: Page) => void;
  onLogout: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentPage,
  setPage,
  onLogout,
}) => {
  const navItems = [
    { id: Page.DASHBOARD, label: "Dashboard", icon: LayoutDashboard },
    { id: Page.PROFILE, label: "My Profile", icon: User },
    { id: Page.RESUME_OPTIMIZER, label: "Resume Optimizer", icon: FileText },
    { id: Page.JOB_MATCHER, label: "Job Matcher", icon: Briefcase },
    { id: Page.JOB_SEARCH, label: "Find Jobs", icon: Search },
    { id: Page.INTERVIEW_COACH, label: "Interview Coach", icon: MessageSquare },
  ];

  return (
    <div className="w-20 lg:w-64 bg-slate-900 text-white flex flex-col h-screen transition-all duration-300 border-r border-slate-800 sticky top-0 left-0 z-50">
      <div className="p-6 flex items-center justify-center lg:justify-start gap-3 border-b border-slate-800">
        <UserCircle className="w-8 h-8 text-indigo-400" />
        <span className="hidden lg:block text-xl font-bold tracking-tight">
          JobHunter AI
        </span>
      </div>

      <nav className="flex-1 py-6 flex flex-col gap-2 px-3">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group
              ${
                currentPage === item.id
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
          >
            <item.icon
              className={`w-6 h-6 ${currentPage === item.id ? "text-white" : "text-slate-400 group-hover:text-white"}`}
            />
            <span className="hidden lg:block font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center lg:justify-start gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="hidden lg:block font-medium">Sign Out</span>
        </button>
        <div className="text-xs text-slate-600 mt-4 text-center lg:text-left px-2">
          <p>Powered by Gemini</p>
          <p>v2.5</p>
        </div>
      </div>
    </div>
  );
};
