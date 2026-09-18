import { fs, type FsNode, type FolderNode } from "./filesystem";

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const BLUE = "\x1b[34m";
const MAGENTA = "\x1b[35m";

export type CommandAction =
  | { type: "open"; fileId: string }
  | { type: "clear" }
  | { type: "denied"; name: string };

export type CommandResult = {
  output: string[];
  cwd?: string;
  action?: CommandAction;
};

function resolvePath(cwd: string, target: string): string {
  if (!target || target === ".") return cwd;
  const cwdParts = cwd.split("/").filter(Boolean);
  const targetParts = target.split("/").filter(Boolean);
  if (target.startsWith("/")) cwdParts.length = 0;
  for (const part of targetParts) {
    if (part === "..") cwdParts.pop();
    else if (part === ".") continue;
    else cwdParts.push(part);
  }
  return "/" + cwdParts.join("/");
}

function getNode(path: string): FsNode | undefined {
  const parts = path.split("/").filter(Boolean);
  let current: FsNode = fs;
  for (const part of parts) {
    if (current.type !== "folder") return undefined;
    const next: FsNode | undefined = current.children.find((c) => c.name === part);
    if (!next) return undefined;
    current = next;
  }
  return current;
}

function listing(node: FolderNode): string[] {
  return node.children.map((c) => {
    if (c.type === "folder") return `${BLUE}${BOLD}${c.name}/${RESET}`;
    if (c.locked) return `${DIM}${c.name}${RESET}`;
    return c.name;
  });
}

const HELP = [
  `${BOLD}Available commands${RESET}`,
  `  ${CYAN}help${RESET}                 show this list`,
  `  ${CYAN}ls${RESET} [path]            list files`,
  `  ${CYAN}cd${RESET} <path>            change directory`,
  `  ${CYAN}pwd${RESET}                  print working directory`,
  `  ${CYAN}cat${RESET} <file>           print a file's contents`,
  `  ${CYAN}open${RESET} <file>          open a file in the editor`,
  `  ${CYAN}whoami${RESET}               who's running this shell`,
  `  ${CYAN}neofetch${RESET}             system info, dev-flex style`,
  `  ${CYAN}about / skills / projects / focus / contact${RESET}`,
  `                        shortcuts to the matching file`,
  `  ${CYAN}clear${RESET}                clear the terminal`,
  ``,
  `${DIM}Tip: Ctrl/Cmd+P opens quick-open, Ctrl/Cmd+Shift+P opens the command palette.${RESET}`,
];

const NEOFETCH = [
  `${CYAN}${BOLD}       /\\        ${RESET}aryan${MAGENTA}@${RESET}portfolio`,
  `${CYAN}${BOLD}      /  \\       ${RESET}${DIM}--------------------${RESET}`,
  `${CYAN}${BOLD}     /    \\      ${RESET}${BOLD}OS${RESET}: second-year CS student`,
  `${CYAN}${BOLD}    /  __  \\     ${RESET}${BOLD}Host${RESET}: Arya College, Jaipur`,
  `${CYAN}${BOLD}   /  |  |  \\    ${RESET}${BOLD}Uptime${RESET}: ~60 days into sem 3`,
  `${CYAN}${BOLD}  /_-''  ''-_\\   ${RESET}${BOLD}Shell${RESET}: daily DSA + SQL reps`,
  `                    ${BOLD}Lang${RESET}: C++, TypeScript, SQL`,
  `                    ${BOLD}Status${RESET}: ${GREEN}building, in the open${RESET}`,
];

export function runCommand(raw: string, cwd: string): CommandResult {
  const trimmed = raw.trim();
  if (!trimmed) return { output: [] };
  const [cmd, ...args] = trimmed.split(/\s+/);
  const arg = args.join(" ");

  switch (cmd) {
    case "help":
      return { output: HELP };

    case "clear":
      return { output: [], action: { type: "clear" } };

    case "pwd":
      return { output: [cwd] };

    case "whoami":
      return { output: ["aryan-raj", `${DIM}(2nd-year CS student, Jaipur -- not root, just building)${RESET}`] };

    case "neofetch":
      return { output: NEOFETCH };

    case "echo":
      return { output: [arg] };

    case "sudo":
      if (arg.replace(/-/g, " ").trim() === "hire me") {
        return {
          output: [
            `${YELLOW}[sudo] password for aryan:${RESET}`,
            `${GREEN}permission granted -- see contact.ts for the actual next step.${RESET}`,
          ],
        };
      }
      return { output: [`${RED}nice try -- this shell doesn't have root, and neither do you.${RESET}`] };

    case "exit":
      return { output: [`${DIM}there's no shell to exit -- you're still on the portfolio.${RESET}`] };

    case "ls": {
      const path = resolvePath(cwd, arg || ".");
      const node = getNode(path);
      if (!node) return { output: [`${RED}ls: ${arg}: no such file or directory${RESET}`] };
      if (node.type === "file") return { output: [node.name] };
      return { output: listing(node) };
    }

    case "cd": {
      if (!arg || arg === "~") return { output: [], cwd: "/" };
      const path = resolvePath(cwd, arg);
      const node = getNode(path);
      if (!node) return { output: [`${RED}cd: ${arg}: no such file or directory${RESET}`] };
      if (node.type === "file") return { output: [`${RED}cd: ${arg}: not a directory${RESET}`] };
      return { output: [], cwd: path };
    }

    case "cat": {
      if (!arg) return { output: [`${RED}cat: missing file operand${RESET}`] };
      const path = resolvePath(cwd, arg);
      const node = getNode(path);
      if (!node || node.type !== "file") return { output: [`${RED}cat: ${arg}: no such file${RESET}`] };
      if (node.locked) return { output: [`${RED}cat: ${arg}: permission denied${RESET}`], action: { type: "denied", name: node.name } };
      return { output: node.content.split("\n") };
    }

    case "open":
    case "code": {
      if (!arg) return { output: [`${RED}${cmd}: missing file operand${RESET}`] };
      const path = resolvePath(cwd, arg);
      const node = getNode(path);
      if (!node || node.type !== "file") return { output: [`${RED}${cmd}: ${arg}: no such file${RESET}`] };
      if (node.locked) return { output: [`${RED}${cmd}: ${arg}: permission denied${RESET}`], action: { type: "denied", name: node.name } };
      return { output: [`${DIM}opening ${node.name}...${RESET}`], action: { type: "open", fileId: node.id } };
    }

    case "about":
    case "skills":
    case "focus":
    case "contact": {
      const fileId = cmd === "about" ? "about" : cmd === "skills" ? "skills" : cmd === "focus" ? "focus" : "contact";
      return { output: [`${DIM}opening ${cmd}...${RESET}`], action: { type: "open", fileId } };
    }

    case "projects":
      return { output: [], cwd: "/projects" };

    default:
      return { output: [`${RED}command not found: ${cmd}${RESET}`, `${DIM}type 'help' for a list of commands${RESET}`] };
  }
}
