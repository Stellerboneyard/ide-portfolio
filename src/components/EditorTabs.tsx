"use client";

import { useIde } from "@/lib/ide-store";
import { FileIcon } from "./FileIcon";

export function EditorTabs() {
  const ide = useIde();
  if (ide.openTabs.length === 0) return null;

  return (
    <div className="flex h-9 shrink-0 overflow-x-auto bg-vs-bg-elevated">
      {ide.openTabs.map((tab) => {
        const active = tab.id === ide.activeTabId;
        return (
          <div
            key={tab.id}
            onClick={() => ide.setActiveTab(tab.id)}
            className={`group flex shrink-0 cursor-pointer items-center gap-2 border-r border-vs-border px-3 text-[13px] ${
              active ? "bg-vs-bg-tab-active text-vs-fg-active" : "bg-vs-bg-tab-inactive text-vs-fg-muted hover:text-vs-fg"
            }`}
            style={active ? { boxShadow: "inset 0 -2px 0 var(--vs-accent-bright)" } : undefined}
          >
            <FileIcon name={tab.name} />
            <span className="py-2 whitespace-nowrap">{tab.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                ide.closeTab(tab.id);
              }}
              className="rounded-sm p-0.5 text-vs-fg-muted opacity-100 hover:bg-white/10 hover:text-white sm:opacity-0 sm:group-hover:opacity-100"
              aria-label={`Close ${tab.name}`}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 6.94 11.06 4l1 1L9 8l2.94 3.06-1 .94L8 9 4.94 12l-1-1L7 8 3.94 4.94l1-1L8 6.94Z" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
