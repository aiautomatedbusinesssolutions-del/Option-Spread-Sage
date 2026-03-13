import { useState, type ReactNode } from "react";
import { useMediaQuery } from "../../hooks/useMediaQuery";

interface MainLayoutProps {
  leftPanel: ReactNode;
  centerPanel: ReactNode;
  rightPanel: ReactNode;
}

const TABS = ["Chart", "Spread", "Dashboard"] as const;
type Tab = (typeof TABS)[number];

export function MainLayout({
  leftPanel,
  centerPanel,
  rightPanel,
}: MainLayoutProps) {
  const [activeTab, setActiveTab] = useState<Tab>("Chart");
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  if (isDesktop) {
    return (
      <div className="grid grid-cols-[1fr_2fr_1fr] gap-4 p-4 max-w-7xl mx-auto flex-1 min-h-0">
        <div className="overflow-y-auto">{leftPanel}</div>
        <div className="overflow-y-auto">{centerPanel}</div>
        <div className="overflow-y-auto">{rightPanel}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Tab bar */}
      <div className="flex border-b border-slate-800 bg-slate-900">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-medium transition-colors cursor-pointer ${
              activeTab === tab
                ? "text-sky-400 border-b-2 border-sky-400"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "Chart" && centerPanel}
        {activeTab === "Spread" && leftPanel}
        {activeTab === "Dashboard" && rightPanel}
      </div>
    </div>
  );
}
