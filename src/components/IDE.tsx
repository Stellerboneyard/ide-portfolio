"use client";

import { IdeProvider, useIde } from "@/lib/ide-store";
import { TitleBar } from "./TitleBar";
import { ActivityBar } from "./ActivityBar";
import { Sidebar } from "./Sidebar";
import { EditorTabs } from "./EditorTabs";
import { EditorPane } from "./EditorPane";
import { Terminal } from "./Terminal";
import { StatusBar } from "./StatusBar";
import { CommandPalette } from "./CommandPalette";

function DeniedToast() {
  const ide = useIde();
  if (!ide.deniedFlash) return null;
  return (
    <div className="pointer-events-none absolute right-4 bottom-8 z-50 rounded-sm border border-vs-red/60 bg-vs-bg-elevated px-4 py-2 text-[13px] text-vs-fg shadow-2xl">
      <span className="text-vs-red">●</span> {ide.deniedFlash}: permission denied
    </div>
  );
}

function IDEBody() {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-vs-bg text-vs-fg">
      <TitleBar />
      <div className="flex min-h-0 flex-1">
        <ActivityBar />
        <Sidebar />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <EditorTabs />
          <div className="flex min-h-0 flex-1 flex-col">
            <EditorPane />
            <Terminal />
          </div>
        </div>
      </div>
      <StatusBar />
      <CommandPalette />
      <DeniedToast />
    </div>
  );
}

export function IDE() {
  return (
    <IdeProvider>
      <IDEBody />
    </IdeProvider>
  );
}
