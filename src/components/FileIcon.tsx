const COLORS: Record<string, string> = {
  ts: "#3178c6",
  tsx: "#3178c6",
  js: "#f1e05a",
  json: "#cbcb41",
  md: "#519aba",
  env: "#8bc34a",
  txt: "#cccccc",
};

export function FileIcon({ name }: { name: string }) {
  const ext = name.includes(".") ? name.split(".").pop()! : "txt";
  const color = COLORS[ext] ?? "#cccccc";
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" className="shrink-0" aria-hidden>
      <path
        d="M3 1.5h6.5L13 5v9.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5v-12a.5.5 0 0 1 .5-.5Z"
        fill="none"
        stroke={color}
        strokeWidth="1"
      />
      <path d="M9.2 1.6V5h3.4" fill="none" stroke={color} strokeWidth="1" />
    </svg>
  );
}

export function FolderIcon({ open }: { open?: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" className="shrink-0" aria-hidden>
      {open ? (
        <path
          d="M1.5 4.5h4l1 1.2h6.6a.9.9 0 0 1 .87 1.13l-1.2 5A.9.9 0 0 1 12 12.5H2.4a.9.9 0 0 1-.9-.9v-7a.9.9 0 0 1 .9-.9Z"
          fill="var(--vs-folder-icon)"
        />
      ) : (
        <path
          d="M1.5 3h4l1.2 1.4H13a.9.9 0 0 1 .9.9v6.8a.9.9 0 0 1-.9.9H2.4a.9.9 0 0 1-.9-.9V3.9a.9.9 0 0 1 .9-.9Z"
          fill="var(--vs-folder-icon)"
        />
      )}
    </svg>
  );
}
