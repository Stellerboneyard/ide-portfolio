"use client";

import { useState } from "react";
import { useIde } from "@/lib/ide-store";

const MENUS: Record<string, string[]> = {
  File: ["New File", "Open Folder...", "Save (nothing to save — it's a portfolio)"],
  Edit: ["Undo", "Redo", "Find"],
  Selection: ["Select All", "Expand Selection"],
  View: ["Command Palette...", "Toggle Sidebar", "Toggle Terminal"],
  Go: ["Go to File...", "Go to Definition (kidding)"],
  Run: ["Run Without Debugging (there's nothing to run — read a file)"],
  Terminal: ["New Terminal", "Toggle Terminal"],
  Help: ["About", "This portfolio's source"],
};

export function TitleBar() {
  const ide = useIde();
  const [open, setOpen] = useState<string | null>(null);

  const handleAction = (menu: string, item: string) => {
    setOpen(null);
    if (item.includes("Toggle Sidebar")) ide.toggleSidebar();
    else if (item.includes("Toggle Terminal") || item.includes("New Terminal")) ide.toggleTerminal();
    else if (item.includes("Command Palette")) ide.openPalette("commands");
    else if (item.includes("Go to File")) ide.openPalette("files");
    else if (menu === "Help" && item.includes("source")) window.open("https://github.com/Stellerboneyard", "_blank");
  };

  return (
    <div className="relative flex h-9 shrink-0 items-center gap-1 bg-vs-bg-titlebar px-2 text-[13px] text-vs-fg select-none">
      <div className="mr-2 flex items-center gap-1.5 pl-1 text-vs-fg-muted">
        <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden>
          <path
            d="M11.5 1.5 15 8l-3.5 6.5-4-1.8V3.3l4-1.8Zm-4 1.8v9.4L1.5 10V6l6-2.7Z"
            fill="#3794ff"
          />
        </svg>
      </div>
      <div className="flex min-w-0 items-center gap-0.5 overflow-x-auto">
        {Object.keys(MENUS).map((menu) => (
          <div key={menu} className="relative shrink-0">
            <button
              onClick={() => setOpen((m) => (m === menu ? null : menu))}
              onMouseEnter={() => open && setOpen(menu)}
              className={`rounded px-1.5 py-1 whitespace-nowrap hover:bg-white/10 sm:px-2 ${open === menu ? "bg-white/10" : ""}`}
            >
              {menu}
            </button>
            {open === menu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setOpen(null)} />
                <div className="absolute top-full left-0 z-50 mt-0.5 min-w-64 rounded-sm border border-black/40 bg-vs-bg-elevated py-1 shadow-2xl">
                  {MENUS[menu].map((item) => (
                    <button
                      key={item}
                      onClick={() => handleAction(menu, item)}
                      className="block w-full px-3 py-1.5 text-left text-[13px] whitespace-nowrap text-vs-fg hover:bg-vs-accent hover:text-white"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      <div className="ml-auto hidden shrink-0 pr-2 text-[12px] whitespace-nowrap text-vs-fg-muted lg:block">
        aryan-raj — Visual Studio Code
      </div>
    </div>
  );
}
