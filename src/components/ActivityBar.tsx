"use client";

import { useIde, type SidebarPanel } from "@/lib/ide-store";

function Icon({ d }: { d: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d={d} />
    </svg>
  );
}

const ICONS = {
  explorer: "M4 4h6l2 2h8v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z",
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm10 17-5.7-5.7",
  git: "M6 3v11M6 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0-15a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm12 3a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 0a9 9 0 0 1-9 9",
  run: "M6 4l14 8-14 8V4Z",
  extensions: "M17 4h-4V2h-2v2H7v4H5v2h2v4H5v2h2v4h4v-2h2v2h4v-4h2v-2h-2v-4h2V8h-2V4Z",
};

export function ActivityBar() {
  const ide = useIde();

  const item = (panel: SidebarPanel, d: string, title: string) => (
    <button
      title={title}
      onClick={() => ide.setSidebarPanel(panel)}
      className={`relative flex h-12 w-12 items-center justify-center border-l-2 ${
        ide.sidebarOpen && ide.sidebarPanel === panel
          ? "border-l-white text-white"
          : "border-l-transparent text-vs-fg-muted hover:text-white"
      }`}
    >
      <Icon d={d} />
    </button>
  );

  return (
    <div className="flex w-12 shrink-0 flex-col items-center justify-between bg-vs-bg-activitybar py-1">
      <div>
        {item("explorer", ICONS.explorer, "Explorer")}
        {item("search", ICONS.search, "Search")}
        <button title="Source Control (cosmetic)" className="flex h-12 w-12 items-center justify-center border-l-2 border-l-transparent text-vs-fg-muted hover:text-white">
          <Icon d={ICONS.git} />
        </button>
        <button title="Run and Debug (cosmetic)" className="flex h-12 w-12 items-center justify-center border-l-2 border-l-transparent text-vs-fg-muted hover:text-white">
          <Icon d={ICONS.run} />
        </button>
        <button title="Extensions (cosmetic)" className="flex h-12 w-12 items-center justify-center border-l-2 border-l-transparent text-vs-fg-muted hover:text-white">
          <Icon d={ICONS.extensions} />
        </button>
      </div>
      <div>
        <a
          href="mailto:aryanqbz@gmail.com"
          title="Contact"
          className="flex h-12 w-12 items-center justify-center border-l-2 border-l-transparent text-vs-fg-muted hover:text-white"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
        </a>
      </div>
    </div>
  );
}
