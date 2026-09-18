"use client";

import { useMemo, useState } from "react";
import { fs, flattenFiles, type FsNode } from "@/lib/filesystem";
import { useIde } from "@/lib/ide-store";
import { FileIcon, FolderIcon } from "./FileIcon";

function Tree({ node, depth }: { node: FsNode; depth: number }) {
  const ide = useIde();
  const [expanded, setExpanded] = useState(true);
  const pad = { paddingLeft: `${depth * 12 + 8}px` };

  if (node.type === "folder") {
    return (
      <div>
        <button
          onClick={() => setExpanded((v) => !v)}
          style={pad}
          className="flex w-full items-center gap-1.5 py-[3px] pr-2 text-left text-[13px] text-vs-fg hover:bg-white/5"
        >
          <span className={`inline-block text-[10px] text-vs-fg-muted transition-transform ${expanded ? "rotate-90" : ""}`}>▶</span>
          <FolderIcon open={expanded} />
          <span>{node.name}</span>
        </button>
        {expanded && node.children.map((c) => <Tree key={c.id} node={c} depth={depth + 1} />)}
      </div>
    );
  }

  const active = ide.activeTabId === node.id;
  return (
    <button
      onClick={() => ide.openFile(node)}
      style={pad}
      className={`flex w-full items-center gap-1.5 py-[3px] pr-2 text-left text-[13px] ${
        active ? "bg-vs-selection text-white" : "text-vs-fg hover:bg-white/5"
      } ${node.locked ? "opacity-50 italic" : ""}`}
      title={node.locked ? "restricted" : undefined}
    >
      <FileIcon name={node.name} />
      <span>{node.name}</span>
    </button>
  );
}

function SearchPanel() {
  const ide = useIde();
  const [query, setQuery] = useState("");
  const files = useMemo(() => flattenFiles(fs), []);
  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return files
      .filter((f) => !f.locked)
      .flatMap((f) => {
        const lines = f.content.split("\n");
        const hits = lines
          .map((line, i) => ({ line, i }))
          .filter(({ line }) => line.toLowerCase().includes(q));
        return hits.length ? [{ file: f, hits: hits.slice(0, 5) }] : [];
      });
  }, [query, files]);

  return (
    <div className="p-2">
      <input
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search"
        className="w-full rounded-sm border border-black/40 bg-vs-bg px-2 py-1 text-[13px] text-vs-fg outline-none focus:border-vs-accent-bright"
      />
      <div className="mt-3 space-y-3">
        {results.map(({ file, hits }) => (
          <div key={file.id}>
            <button
              onClick={() => ide.openFile(file)}
              className="flex items-center gap-1.5 text-[13px] text-vs-fg-active hover:underline"
            >
              <FileIcon name={file.name} />
              {file.name}
            </button>
            {hits.map(({ line, i }) => (
              <div key={i} className="truncate pl-5 text-[12px] text-vs-fg-muted">
                {i + 1}: {line}
              </div>
            ))}
          </div>
        ))}
        {query && results.length === 0 && <p className="text-[12px] text-vs-fg-muted">No results found.</p>}
      </div>
    </div>
  );
}

export function Sidebar() {
  const ide = useIde();
  if (!ide.sidebarOpen) return null;

  return (
    <>
      {/* backdrop: only meaningful on narrow screens where the sidebar is an
          overlay (fixed) rather than pushing the editor into a sliver --
          harmless/invisible at md+ since the sidebar is static there */}
      <div className="fixed inset-0 z-20 bg-black/50 md:hidden" onClick={ide.toggleSidebar} />
      <div className="fixed inset-y-0 left-12 z-30 flex w-60 max-w-[80vw] shrink-0 flex-col overflow-y-auto border-r border-vs-border bg-vs-bg-sidebar md:static md:z-auto md:max-w-none">
        <div className="px-4 pt-3 pb-1 text-[11px] font-bold tracking-wide text-vs-fg-muted uppercase">
          {ide.sidebarPanel === "explorer" ? "Explorer" : "Search"}
        </div>
        {ide.sidebarPanel === "explorer" ? (
          <div className="pb-4">
            <div className="px-2 py-1 text-[11px] font-bold tracking-wide text-vs-fg uppercase">{fs.name}</div>
            {fs.children.map((c) => (
              <Tree key={c.id} node={c} depth={0} />
            ))}
          </div>
        ) : (
          <SearchPanel />
        )}
      </div>
    </>
  );
}
