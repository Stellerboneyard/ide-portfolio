export type FileNode = {
  type: "file";
  id: string;
  name: string;
  language: string;
  content: string;
  locked?: boolean; // shows a "permission denied" easter egg instead of opening
};

export type FolderNode = {
  type: "folder";
  id: string;
  name: string;
  children: (FileNode | FolderNode)[];
};

export type FsNode = FileNode | FolderNode;

const readme = `# aryan-raj/portfolio

Hey — I'm Aryan. Second-year CS student, Jaipur.

This "editor" is the portfolio. Everything in the sidebar is real content,
not filler: click a file to open it, or use the terminal below
(Ctrl/Cmd + \`) if you'd rather \`cat\` your way through it.

## Quick start

- \`about.md\` — who I am, honestly
- \`skills.json\` — what I actually know right now
- \`projects/\` — a small, honest gallery (two slots still open)
- \`focus.ts\` — what my daily hours go toward
- \`contact.ts\` — reach out

Try the terminal: type \`help\`.
`;

const about = `# About

Second-year B.Tech CSE student at Arya College of Engineering & I.T.,
Jaipur — sixty-some days into second year as of writing this, still early.

No full-stack polish, no illusions about that. What's true right now:
daily DSA reps, SQL practice, the core CS fundamentals most people cram
for later, and a couple of builds made to learn rather than to impress.

## Currently

- Building recall in DSA (C++), not just recognition — struggle first,
  extract the pattern after.
- 5 SQL questions a day.
- Clearing college backlog subjects alongside the above.
- This site, and a separate scroll-driven portfolio, both shipped as
  actual practice rather than tutorials.

## Not currently

- Claiming skills I don't have yet. If a project below says "open slot,"
  that's true — not a placeholder dressed up as a project.
`;

const skills = `{
  "languages": {
    "primary": ["C++"],
    "shipping": ["TypeScript", "JavaScript", "SQL"]
  },
  "dsa": {
    "focus": "recall over recognition — daily struggle-first practice",
    "status": "ongoing"
  },
  "fundamentals": ["OS", "DBMS", "Computer Networks"],
  "web": {
    "note": "just enough to ship what I build — this site included",
    "stack": ["Next.js", "React", "Tailwind CSS"]
  },
  "currentlyNotClaiming": [
    "production backend experience",
    "a finished full-stack project with real users"
  ]
}
`;

const freshbites = `// projects/freshbites.ts
// status: concept build — demo-grade, not a live client project

export const freshbites = {
  name: "Freshbites",
  type: "Restaurant concept site",
  stack: ["Next.js", "React", "Tailwind"],
  description:
    "A restaurant concept: menu, ordering flow, admin view. " +
    "Built to learn the full-stack shape of a real order flow — " +
    "not yet hosted, not yet a real client build.",
  repo: "https://github.com/Stellerboneyard/freshbites-restaurant",
};
`;

const openSlot = (n: number) => `// projects/next-build-${n}.ts
// status: open slot

export const nextBuild = {
  name: "TBD",
  note:
    "Reserved for whatever ships next. I'd rather leave this " +
    "honestly empty than dress up a placeholder as a finished project.",
  repo: "https://github.com/Stellerboneyard",
};
`;

const focus = `// focus.ts
// what my daily hours actually go toward right now

type FocusArea = {
  name: string;
  detail: string;
  status: "primary" | "ongoing" | "maintenance" | "paused";
};

export const focus: FocusArea[] = [
  {
    name: "Data Structures & Algorithms (C++)",
    detail: "1hr/day, struggle first on a new problem, then extract the pattern.",
    status: "ongoing",
  },
  {
    name: "SQL",
    detail: "5 questions / 30 min a day.",
    status: "ongoing",
  },
  {
    name: "College backlog subjects",
    detail: "Clearing these alongside DSA/SQL — sized by how urgent each one is.",
    status: "ongoing",
  },
  {
    name: "RBI Grade B prep",
    detail: "Paused for now, not abandoned.",
    status: "paused",
  },
];
`;

const contact = `// contact.ts

export const contact = {
  email: "aryanqbz@gmail.com",
  github: "https://github.com/Stellerboneyard",
  location: "Jaipur, India",
  openTo: ["internships", "collaborations", "just talking shop"],
};
`;

const env = `# permission denied
# (you weren't really expecting secrets in here, were you?)
`;

export const fs: FolderNode = {
  type: "folder",
  id: "root",
  name: "portfolio",
  children: [
    { type: "file", id: "readme", name: "README.md", language: "markdown", content: readme },
    { type: "file", id: "about", name: "about.md", language: "markdown", content: about },
    { type: "file", id: "skills", name: "skills.json", language: "json", content: skills },
    {
      type: "folder",
      id: "projects",
      name: "projects",
      children: [
        { type: "file", id: "proj-freshbites", name: "freshbites.ts", language: "typescript", content: freshbites },
        { type: "file", id: "proj-next-1", name: "next-build-1.ts", language: "typescript", content: openSlot(1) },
        { type: "file", id: "proj-next-2", name: "next-build-2.ts", language: "typescript", content: openSlot(2) },
      ],
    },
    { type: "file", id: "focus", name: "focus.ts", language: "typescript", content: focus },
    { type: "file", id: "contact", name: "contact.ts", language: "typescript", content: contact },
    { type: "file", id: "env", name: ".env", language: "plaintext", content: env, locked: true },
  ],
};

export function flattenFiles(node: FsNode, out: FileNode[] = []): FileNode[] {
  if (node.type === "file") {
    out.push(node);
  } else {
    for (const child of node.children) flattenFiles(child, out);
  }
  return out;
}

export function findFileByPath(path: string): FileNode | undefined {
  const parts = path.split("/").filter(Boolean);
  let current: FsNode = fs;
  for (const part of parts) {
    if (current.type !== "folder") return undefined;
    const next: FsNode | undefined = current.children.find((c) => c.name === part);
    if (!next) return undefined;
    current = next;
  }
  return current.type === "file" ? current : undefined;
}

export function findFileById(id: string): FileNode | undefined {
  return flattenFiles(fs).find((f) => f.id === id);
}
