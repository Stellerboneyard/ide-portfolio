"use client";

import { fs, type FileNode } from "@/lib/filesystem";
import { useIde } from "@/lib/ide-store";

export function WelcomeTab() {
  const ide = useIde();
  const quickLinks = fs.children.filter((c): c is FileNode => c.type === "file");

  return (
    <div className="flex h-full items-center justify-center overflow-y-auto bg-vs-bg px-6 py-10">
      <div className="max-w-xl">
        <svg width="48" height="48" viewBox="0 0 16 16" className="mb-4 opacity-90">
          <path d="M11.5 1.5 15 8l-3.5 6.5-4-1.8V3.3l4-1.8Zm-4 1.8v9.4L1.5 10V6l6-2.7Z" fill="#3794ff" />
        </svg>
        <h1 className="text-2xl font-semibold text-vs-fg-active">aryan-raj / portfolio</h1>
        <p className="mt-2 text-vs-fg-muted">
          A second-year CS student&apos;s portfolio, built to look and work like the editor it was
          written in. Open a file from the sidebar, or use the terminal below.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-2">
          <div>
            <p className="mb-2 text-[11px] font-bold tracking-wide text-vs-fg-muted uppercase">Start</p>
            <button
              onClick={() => ide.openPalette("files")}
              className="block text-left text-vs-accent-bright hover:underline"
            >
              Open file... <span className="text-vs-fg-muted">Ctrl/Cmd+P</span>
            </button>
            <button
              onClick={() => ide.setTerminalOpen(true)}
              className="mt-1.5 block text-left text-vs-accent-bright hover:underline"
            >
              Open terminal... <span className="text-vs-fg-muted">Ctrl/Cmd+`</span>
            </button>
          </div>
          <div>
            <p className="mb-2 text-[11px] font-bold tracking-wide text-vs-fg-muted uppercase">Recent</p>
            {quickLinks.map((f) => (
              <button
                key={f.id}
                onClick={() => ide.openFile(f)}
                className="block text-left text-vs-accent-bright hover:underline"
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
