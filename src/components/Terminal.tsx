"use client";

import { useEffect, useRef, useState } from "react";
import type { Terminal as XTerm } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import { useIde } from "@/lib/ide-store";
import { runCommand } from "@/lib/commands";
import { findFileById } from "@/lib/filesystem";

const PROMPT_COLOR = "\x1b[1;32m"; // bold green
const PATH_COLOR = "\x1b[1;34m"; // bold blue
const RESET = "\x1b[0m";

function displayPath(cwd: string) {
  return cwd === "/" ? "~" : `~${cwd}`;
}

function prompt(cwd: string) {
  return `${PROMPT_COLOR}aryan@portfolio${RESET}:${PATH_COLOR}${displayPath(cwd)}${RESET}$ `;
}

const BANNER = [
  "Welcome to aryan-raj's portfolio shell.",
  "Type \x1b[36mhelp\x1b[0m to see what's available, or \x1b[36mls\x1b[0m to look around.",
  "",
];

export function Terminal() {
  const ide = useIde();
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<XTerm | null>(null);
  const fitRef = useRef<{ fit: () => void } | null>(null);
  const cwdRef = useRef("/");
  const lineRef = useRef("");
  const cursorRef = useRef(0);
  const historyRef = useRef<string[]>([]);
  const historyIdxRef = useRef(0);
  const [height, setHeight] = useState(240);
  const draggingRef = useRef(false);

  useEffect(() => {
    if (!ide.terminalOpen || !containerRef.current || termRef.current) return;

    let disposed = false;
    (async () => {
      const [{ Terminal: XTermCtor }, { FitAddon }] = await Promise.all([
        import("@xterm/xterm"),
        import("@xterm/addon-fit"),
      ]);
      if (disposed || !containerRef.current) return;

      const term = new XTermCtor({
        fontFamily: "var(--font-mono), Menlo, Consolas, monospace",
        fontSize: 13,
        cursorBlink: true,
        convertEol: true,
        theme: {
          background: "#1e1e1e",
          foreground: "#cccccc",
          cursor: "#cccccc",
          selectionBackground: "#264f78",
        },
      });
      const fit = new FitAddon();
      term.loadAddon(fit);
      term.open(containerRef.current);
      fit.fit();
      termRef.current = term;
      fitRef.current = fit;

      BANNER.forEach((line) => term.writeln(line));
      term.write(prompt(cwdRef.current));

      const redrawLine = () => {
        term.write("\x1b[2K\r" + prompt(cwdRef.current) + lineRef.current);
        const back = lineRef.current.length - cursorRef.current;
        if (back > 0) term.write(`\x1b[${back}D`);
      };

      term.onData((data) => {
        const code = data.charCodeAt(0);
        if (data === "\r") {
          term.write("\r\n");
          const line = lineRef.current;
          historyRef.current.push(line);
          historyIdxRef.current = historyRef.current.length;
          const result = runCommand(line, cwdRef.current);
          result.output.forEach((out) => term.writeln(out));
          if (result.cwd) cwdRef.current = result.cwd;
          if (result.action?.type === "clear") term.clear();
          if (result.action?.type === "open") {
            const file = findFileById(result.action.fileId);
            if (file) ide.openFile(file);
          }
          if (result.action?.type === "denied") ide.flashDenied(result.action.name);
          lineRef.current = "";
          cursorRef.current = 0;
          term.write(prompt(cwdRef.current));
        } else if (code === 127) {
          // backspace
          if (cursorRef.current > 0) {
            lineRef.current =
              lineRef.current.slice(0, cursorRef.current - 1) + lineRef.current.slice(cursorRef.current);
            cursorRef.current -= 1;
            redrawLine();
          }
        } else if (data === "\x1b[A") {
          // up
          if (historyIdxRef.current > 0) {
            historyIdxRef.current -= 1;
            lineRef.current = historyRef.current[historyIdxRef.current] ?? "";
            cursorRef.current = lineRef.current.length;
            redrawLine();
          }
        } else if (data === "\x1b[B") {
          // down
          if (historyIdxRef.current < historyRef.current.length) {
            historyIdxRef.current += 1;
            lineRef.current = historyRef.current[historyIdxRef.current] ?? "";
            cursorRef.current = lineRef.current.length;
            redrawLine();
          }
        } else if (data === "\x1b[C") {
          if (cursorRef.current < lineRef.current.length) {
            cursorRef.current += 1;
            term.write("\x1b[C");
          }
        } else if (data === "\x1b[D") {
          if (cursorRef.current > 0) {
            cursorRef.current -= 1;
            term.write("\x1b[D");
          }
        } else if (code === 3) {
          // ctrl+c
          term.write("^C\r\n");
          lineRef.current = "";
          cursorRef.current = 0;
          term.write(prompt(cwdRef.current));
        } else if (!data.startsWith("\x1b") && data >= " ") {
          lineRef.current =
            lineRef.current.slice(0, cursorRef.current) + data + lineRef.current.slice(cursorRef.current);
          cursorRef.current += data.length;
          redrawLine();
        }
      });
    })();

    return () => {
      disposed = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ide.terminalOpen]);

  useEffect(() => {
    if (!ide.terminalOpen) return;
    const onResize = () => fitRef.current?.fit();
    window.addEventListener("resize", onResize);
    const t = window.setTimeout(onResize, 50);
    return () => {
      window.removeEventListener("resize", onResize);
      window.clearTimeout(t);
    };
  }, [ide.terminalOpen, height]);

  useEffect(() => {
    return () => {
      termRef.current?.dispose();
      termRef.current = null;
    };
  }, []);

  const startDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    draggingRef.current = true;
    const onMove = (ev: MouseEvent) => {
      if (!draggingRef.current) return;
      const next = Math.min(Math.max(window.innerHeight - ev.clientY - 22, 120), window.innerHeight - 160);
      setHeight(next);
    };
    const onUp = () => {
      draggingRef.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  if (!ide.terminalOpen) return null;

  return (
    <div className="flex shrink-0 flex-col border-t border-vs-border bg-vs-bg" style={{ height }}>
      <div onMouseDown={startDrag} className="h-1 shrink-0 cursor-row-resize hover:bg-vs-accent-bright" />
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-vs-border px-3">
        <div className="flex items-center gap-4 text-[11px] font-bold tracking-wide text-vs-fg-muted uppercase">
          <span className="border-b-2 border-vs-fg-active pb-2 pt-2 text-vs-fg-active">Terminal</span>
        </div>
        <button
          onClick={ide.toggleTerminal}
          aria-label="Close terminal"
          className="rounded-sm p-1 text-vs-fg-muted hover:bg-white/10 hover:text-white"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 6.94 11.06 4l1 1L9 8l2.94 3.06-1 .94L8 9 4.94 12l-1-1L7 8 3.94 4.94l1-1L8 6.94Z" />
          </svg>
        </button>
      </div>
      <div ref={containerRef} className="min-h-0 flex-1 px-2 py-1" />
    </div>
  );
}
