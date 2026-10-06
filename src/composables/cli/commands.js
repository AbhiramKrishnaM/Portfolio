import { GAME_REGISTRY } from "@/data/games.js";
import { EMAIL, social } from "@/data/socials.js";
import { NOW } from "@/data/now.js";
import { ACHIEVEMENTS, isUnlocked, unlockedCount, unlock } from "@/composables/achievements.js";
import { getRecentCommits, timeAgo, GITHUB_USER } from "./githubLog.js";
import { nextLineId } from "./terminalState.js";
import { printWhoami, printSocials, printProjects } from "./printers.js";

const HELP_ROWS = [
  { cmd: "projects", desc: "list projects" },
  { cmd: "ls blog", desc: "list blog posts" },
  { cmd: "ls socials", desc: "list social links" },
  { cmd: "cd projects", desc: "go to projects" },
  { cmd: "cd blog", desc: "go to blog" },
  { cmd: "cd home", desc: "go home" },
  { cmd: "cat cv", desc: "quick CV overview" },
  { cmd: "cd cv", desc: "view full CV" },
  { cmd: "whoami", desc: "who am I?" },
  { cmd: "now", desc: "what I'm up to" },
  { cmd: "achievements", desc: "badges you've unlocked" },
  { cmd: "git log", desc: "my recent commits" },
  { cmd: "contact", desc: "get in touch" },
  { cmd: "/game", desc: "launch a mini-game" },
  { cmd: "clear", desc: "clear terminal" },
  { cmd: "help", desc: "show this message" },
  { cmd: "ctrl/⌘ + k", desc: "command palette" },
];

function gitLogErrorMessage(err) {
  if (err?.kind === "rate-limit") {
    const mins = err.resetAt ? Math.max(1, Math.ceil((err.resetAt - Date.now()) / 60000)) : 1;
    return `// github's rate limit says slow down — try again in ~${mins} min. meanwhile:`;
  }
  if (err?.kind === "network") return "// couldn't reach github — are you offline? the commits live here:";
  return `// github returned an error${err?.status ? ` (${err.status})` : ""} — try again in a bit. meanwhile:`;
}

export function createCommands(term, scenes) {
  const { addLine, blank } = term;

  const comingSoon = (message) => () => {
    addLine("comment", message);
    blank();
  };

  async function runGitLog() {
    unlock("lurker");
    const token = scenes.currentToken();
    term.booting.value = true;
    const loadingId = nextLineId();
    term.lines.value.push({ id: loadingId, type: "comment", content: `// fetching recent commits from github.com/${GITHUB_USER}…` });

    let result = null;
    let error = null;
    try {
      result = await getRecentCommits();
    } catch (err) {
      error = err;
    }
    if (token !== scenes.currentToken()) return;
    term.removeLine(loadingId);

    if (result) {
      if (!result.commits.length) addLine("comment", "// no public commits yet");
      result.commits.forEach((c) => addLine("commit-row", { ...c, ago: timeAgo(c.date) }));
      if (result.source === "cache") {
        addLine("comment", `// cached ${timeAgo(result.fetchedAt)} · refreshes every 10m`);
      } else if (result.source === "stale") {
        addLine("comment", `// couldn't reach github just now — showing commits from ${timeAgo(result.fetchedAt)}`);
      }
    } else {
      addLine("comment", gitLogErrorMessage(error));
    }
    addLine("link", { text: `github.com/${GITHUB_USER}`, url: `https://github.com/${GITHUB_USER}` });
    blank();
    term.booting.value = false;
  }

  return {
    whoami: () => printWhoami(term),
    "ls socials": () => printSocials(term),
    projects: () => printProjects(term),
    "ls projects": () => printProjects(term),

    achievements() {
      addLine("comment", `// achievements · ${unlockedCount.value}/${ACHIEVEMENTS.length} unlocked`);
      ACHIEVEMENTS.forEach((a) => {
        const unlocked = isUnlocked(a.id);
        const hiddenForNow = a.secret && !unlocked;
        addLine("achievement-row", {
          name: hiddenForNow ? "???" : a.name,
          desc: hiddenForNow ? "secret — keep exploring" : a.desc,
          unlocked,
        });
      });
      blank();
    },

    "ls blog": comingSoon("// blog — coming soon"),
    "cd projects": comingSoon("// navigating to projects — coming soon"),
    "cd blog": comingSoon("// blog — coming soon"),
    "cd home": comingSoon("// you are already home"),
    "cat cv": comingSoon("// cv — coming soon"),
    "cd cv": comingSoon("// cv — coming soon"),

    now() {
      const updated = new Date(NOW.updated).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
      addLine("comment", `// what I'm up to · updated ${updated}`);
      addLine("pair", { label: "BUILD", value: NOW.building });
      addLine("pair", { label: "LEARN", value: NOW.learning });
      addLine("pair", { label: "MUSIC", value: `♪ ${NOW.listening}` });
      blank();
    },

    "git log": runGitLog,
    "git log --oneline": runGitLog,

    contact() {
      addLine("comment", "// get in touch");
      addLine("link", { text: EMAIL, url: social("email").url });
      blank();
    },

    help() {
      unlock("rtfm");
      addLine("comment", "Available commands:");
      HELP_ROWS.forEach((row) => addLine("help-row", row));
      blank();
      addLine("comment", "Some commands aren't listed. Try things.");
      blank();
    },

    "/game"() {
      if (term.menuState.value) return;
      addLine("comment", "// ↑ ↓ to navigate  ·  enter to launch  ·  esc to cancel");
      addLine("game-menu", { games: GAME_REGISTRY, frozenIndex: null });
      blank();
      term.menuState.value = { selectedIndex: 0 };
    },

    clear() {
      term.lines.value = [];
      term.menuState.value = null;
      scenes.resetToIntro();
    },
  };
}
