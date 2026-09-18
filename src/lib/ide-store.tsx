"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { FileNode } from "./filesystem";

export type SidebarPanel = "explorer" | "search";
export type PaletteMode = "files" | "commands" | null;

type IdeState = {
  openTabs: FileNode[];
  activeTabId: string | null;
  sidebarOpen: boolean;
  sidebarPanel: SidebarPanel;
  terminalOpen: boolean;
  paletteMode: PaletteMode;
  deniedFlash: string | null; // filename that just triggered a "permission denied" flash
};

type IdeApi = IdeState & {
  openFile: (file: FileNode) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  toggleSidebar: () => void;
  setSidebarPanel: (panel: SidebarPanel) => void;
  toggleTerminal: () => void;
  setTerminalOpen: (open: boolean) => void;
  openPalette: (mode: PaletteMode) => void;
  closePalette: () => void;
  flashDenied: (name: string) => void;
};

const IdeContext = createContext<IdeApi | null>(null);

export function IdeProvider({ children }: { children: React.ReactNode }) {
  const [openTabs, setOpenTabs] = useState<FileNode[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarPanel, setSidebarPanel] = useState<SidebarPanel>("explorer");
  const [terminalOpen, setTerminalOpen] = useState(true);
  const [paletteMode, setPaletteMode] = useState<PaletteMode>(null);
  const [deniedFlash, setDeniedFlash] = useState<string | null>(null);

  // Sidebar defaults open on desktop (matches real VS Code) but would crush
  // the editor into a sliver on a phone-width screen, where it's meant to be
  // an overlay instead -- start closed there. One-time check on mount, not
  // a resize listener: this is about the device you loaded on, not a live
  // toggle as the window happens to resize.
  useEffect(() => {
    if (window.innerWidth < 768) setSidebarOpen(false);
  }, []);

  const openFile = useCallback((file: FileNode) => {
    if (file.locked) {
      setDeniedFlash(file.name);
      window.setTimeout(() => setDeniedFlash(null), 1600);
      return;
    }
    setOpenTabs((tabs) => (tabs.some((t) => t.id === file.id) ? tabs : [...tabs, file]));
    setActiveTabId(file.id);
  }, []);

  const closeTab = useCallback(
    (id: string) => {
      setOpenTabs((tabs) => {
        const idx = tabs.findIndex((t) => t.id === id);
        const next = tabs.filter((t) => t.id !== id);
        if (activeTabId === id) {
          const fallback = next[idx] ?? next[idx - 1] ?? next[next.length - 1];
          setActiveTabId(fallback ? fallback.id : null);
        }
        return next;
      });
    },
    [activeTabId],
  );

  const value = useMemo<IdeApi>(
    () => ({
      openTabs,
      activeTabId,
      sidebarOpen,
      sidebarPanel,
      terminalOpen,
      paletteMode,
      deniedFlash,
      openFile,
      closeTab,
      setActiveTab: setActiveTabId,
      toggleSidebar: () => setSidebarOpen((v) => !v),
      // Reads the captured `sidebarPanel` from this render directly rather
      // than a functional setSidebarPanel(prev => ...) updater -- an
      // earlier version called setSidebarOpen as a side effect *inside*
      // that updater, which is impure. React (Strict Mode, dev only)
      // double-invokes updaters to catch exactly that, which silently
      // cancelled the toggle: false -> true -> false before it ever
      // painted. `value` already lists sidebarPanel as a useMemo dep, so
      // this closure is current on every render where it changes.
      setSidebarPanel: (panel) => {
        if (sidebarPanel === panel) {
          setSidebarOpen((open) => !open);
        } else {
          setSidebarPanel(panel);
          setSidebarOpen(true);
        }
      },
      toggleTerminal: () => setTerminalOpen((v) => !v),
      setTerminalOpen,
      openPalette: setPaletteMode,
      closePalette: () => setPaletteMode(null),
      flashDenied: (name: string) => {
        setDeniedFlash(name);
        window.setTimeout(() => setDeniedFlash(null), 1600);
      },
    }),
    [openTabs, activeTabId, sidebarOpen, sidebarPanel, terminalOpen, paletteMode, deniedFlash, openFile, closeTab],
  );

  return <IdeContext.Provider value={value}>{children}</IdeContext.Provider>;
}

export function useIde(): IdeApi {
  const ctx = useContext(IdeContext);
  if (!ctx) throw new Error("useIde must be used within IdeProvider");
  return ctx;
}
