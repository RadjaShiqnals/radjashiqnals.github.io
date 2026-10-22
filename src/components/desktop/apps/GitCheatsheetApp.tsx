import React, { useState, useMemo } from "react";
import type { Locale } from "../../../lib/i18n";
import { Search, Copy, Check, AlertTriangle, GitBranch, GitCommit, GitMerge, RotateCcw, Terminal } from "lucide-react";

interface GitCheatsheetAppProps {
  locale: Locale;
}

interface GitCommand {
  cmd: string;
  desc: string;
  category: "basics" | "branches" | "undo" | "history" | "config";
  dangerous?: boolean;
}

const COMMANDS: GitCommand[] = [
  // Basics
  { cmd: "git init", desc: "Initialize a brand new local Git repository", category: "basics" },
  { cmd: "git clone <url>", desc: "Clone an existing remote repository into a new directory", category: "basics" },
  { cmd: "git status -s", desc: "Show short format status of modified and staged files", category: "basics" },
  { cmd: "git add .", desc: "Stage all modified and untracked files for the next commit", category: "basics" },
  { cmd: 'git commit -m "feat: message"', desc: "Commit staged changes with a descriptive message", category: "basics" },
  { cmd: "git push origin <branch>", desc: "Push committed changes to remote repository", category: "basics" },
  { cmd: "git pull --rebase", desc: "Fetch remote updates and rebase local commits on top", category: "basics" },

  // Branches
  { cmd: "git checkout -b <branch>", desc: "Create and switch to a new branch immediately", category: "branches" },
  { cmd: "git switch <branch>", desc: "Switch to an existing local branch", category: "branches" },
  { cmd: "git branch -a", desc: "List all local and remote tracking branches", category: "branches" },
  { cmd: "git branch -d <branch>", desc: "Safely delete a merged branch locally", category: "branches" },
  { cmd: "git branch -D <branch>", desc: "Force delete a branch regardless of merge status", category: "branches", dangerous: true },
  { cmd: "git merge <branch>", desc: "Merge specified branch into the current active branch", category: "branches" },

  // Undo & Rescue
  { cmd: "git restore <file>", desc: "Discard unstaged working directory changes for a file", category: "undo" },
  { cmd: "git restore --staged <file>", desc: "Unstage a file while keeping its working changes", category: "undo" },
  { cmd: "git commit --amend --no-edit", desc: "Amend staged changes into the previous commit without changing message", category: "undo" },
  { cmd: "git reset --soft HEAD~1", desc: "Undo the last commit and keep all changed files staged", category: "undo" },
  { cmd: "git reset --hard HEAD~1", desc: "Permanently discard the last commit and all its changes", category: "undo", dangerous: true },
  { cmd: "git clean -fd", desc: "Remove all untracked files and directories from the workspace", category: "undo", dangerous: true },
  { cmd: "git push --force-with-lease", desc: "Safer force push that aborts if someone else pushed changes", category: "undo", dangerous: true },

  // History & Stash
  { cmd: "git log --oneline --graph --decorate", desc: "Visual ASCII branch commit graph", category: "history" },
  { cmd: "git diff", desc: "Show unstaged changes between working tree and index", category: "history" },
  { cmd: "git stash push -m 'wip'", desc: "Temporarily shelve dirty working directory changes", category: "history" },
  { cmd: "git stash pop", desc: "Restore the most recently stashed changes and drop from stash", category: "history" },
  { cmd: "git cherry-pick <commit-hash>", desc: "Apply changes from an existing commit onto current branch", category: "history" },

  // Config
  { cmd: "git config --global user.name 'Your Name'", desc: "Set global author name for commits", category: "config" },
  { cmd: "git config --global user.email 'you@email.com'", desc: "Set global author email for commits", category: "config" },
  { cmd: "git remote -v", desc: "List configured remote repository URLs", category: "config" },
];

export const GitCheatsheetApp: React.FC<GitCheatsheetAppProps> = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 1800);
  };

  const filteredCommands = useMemo(() => {
    return COMMANDS.filter((item) => {
      const matchCat = activeCategory === "all" || item.category === activeCategory;
      const matchQuery =
        !search.trim() ||
        item.cmd.toLowerCase().includes(search.toLowerCase()) ||
        item.desc.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [search, activeCategory]);

  const categories = [
    { id: "all", label: "All Commands", icon: Terminal },
    { id: "basics", label: "Basics", icon: GitCommit },
    { id: "branches", label: "Branches", icon: GitBranch },
    { id: "undo", label: "Undo & Rescue", icon: RotateCcw },
    { id: "history", label: "History & Stash", icon: GitMerge },
  ];

  return (
    <div className="h-full w-full flex flex-col bg-[#141414]/95 text-neutral-200 select-none overflow-hidden">
      {/* Search Header */}
      <div className="p-4 border-b border-white/10 bg-black/30 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search git commands or recipes..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-400 transition-all"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1 sm:pb-0">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                activeCategory === c.id
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10"
              }`}
            >
              <c.icon className="w-3.5 h-3.5" />
              <span>{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Commands List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {filteredCommands.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-sm text-neutral-500">
            No matching Git commands found.
          </div>
        ) : (
          filteredCommands.map((item) => (
            <div
              key={item.cmd}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all gap-3"
            >
              <div className="space-y-1 truncate pr-2">
                <div className="flex items-center gap-2">
                  <code className="font-mono text-sm text-cyan-300 font-semibold">{item.cmd}</code>
                  {item.dangerous && (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-500/20 text-red-300 border border-red-500/30">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Destructive</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-400">{item.desc}</p>
              </div>

              <button
                onClick={() => copyCommand(item.cmd)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white text-xs font-medium transition-colors cursor-pointer self-start sm:self-auto shrink-0"
              >
                {copiedCmd === item.cmd ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
