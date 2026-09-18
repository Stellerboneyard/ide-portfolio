"use client";

import { useIde } from "@/lib/ide-store";

export function StatusBar() {
  const ide = useIde();
  const activeTab = ide.openTabs.find((t) => t.id === ide.activeTabId);

  return (
    <div className="flex h-[22px] shrink-0 items-center justify-between overflow-hidden bg-vs-bg-statusbar px-2 text-[12px] whitespace-nowrap text-white select-none">
      <div className="flex min-w-0 items-center gap-3">
        <span className="hidden shrink-0 items-center gap-1 sm:flex">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
            <path d="M10 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM4 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0 6v3a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V9" />
          </svg>
          main
        </span>
        <button onClick={ide.toggleSidebar} className="shrink-0 rounded-sm px-1 hover:bg-white/10">
          ☰ <span className="hidden sm:inline">Explorer</span>
        </button>
        <button onClick={ide.toggleTerminal} className="hidden shrink-0 rounded-sm px-1 hover:bg-white/10 sm:inline">
          Terminal
        </button>
      </div>
      <div className="flex min-w-0 items-center gap-3">
        {activeTab && (
          <>
            <span className="hidden sm:inline">{activeTab.language}</span>
            <span className="hidden md:inline">UTF-8</span>
          </>
        )}
        <span className="hidden sm:inline">Ln 1, Col 1</span>
        <span className="flex shrink-0 items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
            <path d="M8 1 1 4.5v5c0 4 3 6.5 7 8.5 4-2 7-4.5 7-8.5v-5L8 1Z" />
          </svg>
          <span className="hidden md:inline">building in the open</span>
        </span>
      </div>
    </div>
  );
}
