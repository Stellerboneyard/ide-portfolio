"use client";

import dynamic from "next/dynamic";
import { useIde } from "@/lib/ide-store";
import { WelcomeTab } from "./WelcomeTab";

const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center text-vs-fg-muted">Loading editor…</div>,
});

export function EditorPane() {
  const ide = useIde();
  const activeTab = ide.openTabs.find((t) => t.id === ide.activeTabId);

  if (!activeTab) return <WelcomeTab />;

  return (
    <div className="min-h-0 flex-1">
      <Editor
        key={activeTab.id}
        path={activeTab.name}
        language={activeTab.language}
        value={activeTab.content}
        theme="vs-dark"
        options={{
          readOnly: true,
          domReadOnly: true,
          fontSize: 14,
          fontFamily: "var(--font-mono), Menlo, Consolas, monospace",
          minimap: { enabled: true },
          scrollBeyondLastLine: false,
          renderLineHighlight: "all",
          contextmenu: false,
          wordWrap: "on",
          padding: { top: 12 },
        }}
      />
    </div>
  );
}
