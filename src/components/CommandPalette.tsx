"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { fs, flattenFiles } from "@/lib/filesystem";
import { useIde } from "@/lib/ide-store";
import { FileIcon } from "./FileIcon";

type Command = { id: string; label: string; run: () => void };

export function CommandPalette() {
  const ide = useIde();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const open = ide.paletteMode !== null;
  const files = useMemo(() => flattenFiles(fs).filter((f) => !f.locked), []);

  const commands: Command[] = useMemo(
    () => [
      { id: "toggle-sidebar", label: "View: Toggle Sidebar", run: ide.toggleSidebar },
      { id: "toggle-terminal", label: "View: Toggle Terminal", run: ide.toggleTerminal },
      { id: "open-about", label: "Go to File: about.md", run: () => { const f = files.find(f=>f.id==="about"); if(f) ide.openFile(f); } },
      { id: "open-contact", label: "Go to File: contact.ts", run: () => { const f = files.find(f=>f.id==="contact"); if(f) ide.openFile(f); } },
      { id: "open-github", label: "Open: GitHub Profile", run: () => window.open("https://github.com/Stellerboneyard", "_blank") },
      { id: "open-scroll-portfolio", label: "Open: the other portfolio (scroll/video version)", run: () => window.open("https://stellerboneyard.github.io/portfolio/", "_blank") },
      { id: "email", label: "Contact: Send an email", run: () => window.open("mailto:aryanqbz@gmail.com") },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [files],
  );

  const items = useMemo(() => {
    const q = query.toLowerCase();
    if (ide.paletteMode === "files") {
      return files
        .filter((f) => f.name.toLowerCase().includes(q))
        .map((f) => ({ id: f.id, label: f.name, run: () => ide.openFile(f) }));
    }
    return commands.filter((c) => c.label.toLowerCase().includes(q));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, ide.paletteMode, files, commands]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open, ide.paletteMode]);

  useEffect(() => setSelected(0), [query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "p") {
        e.preventDefault();
        ide.openPalette(e.shiftKey ? "commands" : "files");
      } else if (meta && e.key === "`") {
        e.preventDefault();
        ide.toggleTerminal();
      } else if (e.key === "Escape" && open) {
        ide.closePalette();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const runSelected = () => {
    const item = items[selected];
    if (item) {
      item.run();
      ide.closePalette();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-24" onClick={() => ide.closePalette()}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl overflow-hidden rounded-md border border-black/50 bg-vs-bg-elevated shadow-2xl"
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setSelected((s) => Math.min(s + 1, items.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setSelected((s) => Math.max(s - 1, 0));
            } else if (e.key === "Enter") {
              e.preventDefault();
              runSelected();
            }
          }}
          placeholder={ide.paletteMode === "files" ? "Go to file..." : "Type a command..."}
          className="w-full border-b border-vs-border bg-transparent px-4 py-3 text-[14px] text-vs-fg-active outline-none"
        />
        <div className="max-h-80 overflow-y-auto py-1">
          {items.length === 0 && <div className="px-4 py-3 text-[13px] text-vs-fg-muted">No matches.</div>}
          {items.map((item, i) => (
            <button
              key={item.id}
              onMouseEnter={() => setSelected(i)}
              onClick={runSelected}
              className={`flex w-full items-center gap-2 px-4 py-1.5 text-left text-[13px] ${
                i === selected ? "bg-vs-accent text-white" : "text-vs-fg"
              }`}
            >
              {ide.paletteMode === "files" && <FileIcon name={item.label} />}
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
