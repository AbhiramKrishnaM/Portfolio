/**
 * useCLI — command registry, output history, and menu state.
 *
 * To add a new command:   add a key + handler to `commands` below.
 * To add a new game:      add an entry to GAME_REGISTRY below.
 */

import { ref } from "vue";
import { PROJECTS } from "@/composables/projects.js";
import { SOCIALS, EMAIL, social } from "@/composables/socials.js";
import { getRecentCommits, timeAgo, GITHUB_USER } from "@/composables/githubLog.js";
import { randomFortune, cowsay, trainFrame, TRAIN_WIDTH } from "@/composables/easterEggs.js";

// ─── Boot animation helpers ────────────────────────────────────────────────────
const _delay = (ms) => new Promise((r) => setTimeout(r, ms));

// Persists across navigation but resets on page refresh
let _hasBooted = false;

// ─── Game Registry ─────────────────────────────────────────────────────────────
// Each entry needs: id (unique), label (display name), description.
// Set comingSoon: true to show the item as disabled in the picker.
export const GAME_REGISTRY = [
  {
    id: "snake",
    label: "_snake-game",
    description: "classic snake",
    comingSoon: false,
    githubUrl: "https://github.com/AbhiramKrishnaM/snake-game-starter",
  },
  {
    id: "sudoku",
    label: "_sudoku",
    description: "number puzzle",
    comingSoon: false,
    githubUrl: null,
  },
  {
    id: "tetris",
    label: "_tetris",
    description: "block stacking",
    comingSoon: false,
    githubUrl: null,
  },
];

// ─── Internal uid ──────────────────────────────────────────────────────────────
let _uid = 0;
const uid = () => ++_uid;

// ─── Composable ────────────────────────────────────────────────────────────────
export function useCLI() {
  /** Array of rendered output lines. Each line: { id, type, content } */
  const lines = ref([]);

  /**
   * Active menu state — null when no menu is open.
   * { selectedIndex: number }
   */
  const menuState = ref(null);

  /** True while the boot animation is running — hides the input prompt. */
  const booting = ref(false);

  /**
   * Full-terminal takeover for hidden commands — "matrix" | "vim" | null.
   * TerminalWindow renders the matching overlay and hides the prompt.
   */
  const overlay = ref(null);

  /** Approx. character columns of the output area (text-xs), set by TerminalWindow. */
  const columns = ref(60);

  /** Animated-scene state — see playScene() below. */
  const SCENE_CANCELLED = Symbol("scene-cancelled");
  let sceneToken = 0;
  let currentScene = null;

  /** Command input history (most recent first). */
  const cmdHistory = ref([]);
  const historyIdx = ref(-1);

  // ─── line helpers ────────────────────────────────────────────────────────────
  const addLine = (type, content) =>
    lines.value.push({ id: uid(), type, content });
  const blank = () => addLine("blank", null);
  const addSocial = ({ text, url }) => addLine("link", { text, url });

  /**
   * Preformatted multi-line block (ASCII art). `label` is what screen readers
   * announce instead of the art; tone: "text" | "accent".
   */
  const addPre = (text, label, tone = "text") => {
    const id = uid();
    lines.value.push({ id, type: "pre", content: { text, label, tone } });
    return id;
  };

  function printProjects() {
    addLine("comment", "// projects");
    PROJECTS.forEach((project) => addLine("project-row", project));
    blank();
  }

  // ─── command registry ────────────────────────────────────────────────────────
  // Add a new command by adding a key here. Value must be () => void.
  const commands = {
    whoami() {
      addLine("pair", { label: "ROLE ", value: "Fullstack Engineer" });
      addLine("pair", {
        label: "LOC  ",
        value: "Kozhikode, Kerala, India",
      });
      addLine("pair", {
        label: "STACK",
        value: "Vue · React · Node · Python · Docker · AWS",
      });
      blank();
    },

    "ls socials"() {
      addLine("comment", "// socials");
      SOCIALS.forEach(addSocial);
      blank();
    },

    projects() {
      printProjects();
    },

    "ls projects"() {
      printProjects();
    },

    "ls blog"() {
      addLine("comment", "// blog — coming soon");
      blank();
    },

    "cd projects"() {
      addLine("comment", "// navigating to projects — coming soon");
      blank();
    },

    "cd blog"() {
      addLine("comment", "// blog — coming soon");
      blank();
    },

    "cd home"() {
      addLine("comment", "// you are already home");
      blank();
    },

    "cat cv"() {
      addLine("comment", "// cv — coming soon");
      blank();
    },

    "cd cv"() {
      addLine("comment", "// cv — coming soon");
      blank();
    },

    "git log"() {
      runGitLog();
    },

    "git log --oneline"() {
      runGitLog();
    },

    contact() {
      addLine("comment", "// get in touch");
      addLine("link", { text: EMAIL, url: social("email").url });
      blank();
    },

    help() {
      addLine("comment", "Available commands:");
      addLine("help-row", { cmd: "projects", desc: "list projects" });
      addLine("help-row", { cmd: "ls blog", desc: "list blog posts" });
      addLine("help-row", { cmd: "ls socials", desc: "list social links" });
      addLine("help-row", { cmd: "cd projects", desc: "go to projects" });
      addLine("help-row", { cmd: "cd blog", desc: "go to blog" });
      addLine("help-row", { cmd: "cd home", desc: "go home" });
      addLine("help-row", { cmd: "cat cv", desc: "quick CV overview" });
      addLine("help-row", { cmd: "cd cv", desc: "view full CV" });
      addLine("help-row", { cmd: "whoami", desc: "who am I?" });
      addLine("help-row", { cmd: "git log", desc: "my recent commits" });
      addLine("help-row", { cmd: "contact", desc: "get in touch" });
      addLine("help-row", { cmd: "/game", desc: "launch a mini-game" });
      addLine("help-row", { cmd: "clear", desc: "clear terminal" });
      addLine("help-row", { cmd: "help", desc: "show this message" });
      addLine("help-row", { cmd: "ctrl/⌘ + k", desc: "command palette" });
      blank();
      addLine("comment", "Some commands aren't listed. Try things.");
      blank();
    },

    "/game"() {
      if (menuState.value) return; // guard: only one menu at a time
      addLine("comment", "// ↑ ↓ to navigate  ·  enter to launch  ·  esc to cancel");
      addLine("game-menu", { games: GAME_REGISTRY, frozenIndex: null });
      blank();
      menuState.value = { selectedIndex: 0 };
    },

    clear() {
      lines.value = [];
      menuState.value = null;
      currentScene = "intro";
      runBoot();
    },
  };

  // ─── hidden commands ─────────────────────────────────────────────────────────
  // Not listed in `help` and not offered by tab completion — they're for people
  // who poke around ("Some commands aren't listed. Try things.").
  const secretCommands = {
    fortune() {
      addLine("comment", `// ${randomFortune()}`);
      blank();
    },

    sl() {
      runTrain();
    },

    matrix() {
      overlay.value = "matrix";
    },
  };

  // Commands that take free-text arguments: handler receives the rest of the line.
  const argCommands = {
    cowsay(text) {
      const message = text || "moo. try: cowsay <text>";
      addPre(cowsay(message, Math.min(40, columns.value - 8)), `a cow says: ${message}`);
      blank();
    },

    sudo(args) {
      if (args.toLowerCase() === "hire-me") {
        addLine("comment", "[sudo] password for visitor: ********");
        addLine("comment", "// access granted. excellent decision.");
        addLine("comment", "// initiating hire sequence — next step is yours:");
        ["email", "linkedin", "github"].forEach((id) => addSocial(social(id)));
      } else {
        addLine("error", "visitor is not in the sudoers file. This incident will be reported.");
      }
      blank();
    },

    vim() {
      overlay.value = "vim";
    },
  };
  argCommands.vi = argCommands.vim;
  argCommands.nvim = argCommands.vim;

  /** Called by the overlay components when the visitor gets out. */
  function exitOverlay() {
    const kind = overlay.value;
    overlay.value = null;
    if (kind === "vim") addLine("comment", "// you escaped vim. put that on your resume.");
    if (kind === "matrix") addLine("comment", "// welcome back to the real world.");
    blank();
  }

  /** `git log` — recent public commits from GitHub, one line each. */
  async function runGitLog() {
    const token = sceneToken; // a scene change (scrolling) discards the result
    booting.value = true;
    const loadingId = uid();
    lines.value.push({ id: loadingId, type: "comment", content: `// fetching recent commits from github.com/${GITHUB_USER}…` });

    let result = null;
    let error = null;
    try {
      result = await getRecentCommits();
    } catch (err) {
      error = err;
    }
    if (token !== sceneToken) return; // new scene owns the terminal now
    lines.value = lines.value.filter((l) => l.id !== loadingId);

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
    booting.value = false;
  }

  function gitLogErrorMessage(err) {
    if (err?.kind === "rate-limit") {
      const mins = err.resetAt ? Math.max(1, Math.ceil((err.resetAt - Date.now()) / 60000)) : 1;
      return `// github's rate limit says slow down — try again in ~${mins} min. meanwhile:`;
    }
    if (err?.kind === "network") return "// couldn't reach github — are you offline? the commits live here:";
    return `// github returned an error${err?.status ? ` (${err.status})` : ""} — try again in a bit. meanwhile:`;
  }

  /** `sl` — drives an ASCII train across the output, right to left. */
  async function runTrain() {
    const token = sceneToken; // a scene change (scrolling) aborts the ride
    booting.value = true;
    const label = "a train drives across the terminal";
    const id = addPre("", label, "accent");
    for (let offset = columns.value, frame = 0; offset > -TRAIN_WIDTH; offset--, frame++) {
      await _delay(30);
      if (token !== sceneToken) return; // new scene owns the terminal now
      const idx = lines.value.findIndex((l) => l.id === id);
      if (idx === -1) return;
      lines.value[idx] = { id, type: "pre", content: { text: trainFrame(Math.floor(frame / 4), offset), label, tone: "accent" } };
    }
    lines.value = lines.value.filter((l) => l.id !== id);
    booting.value = false;
  }

  // ─── execute a raw command string ────────────────────────────────────────────
  function execute(raw) {
    const cmd = raw.trim();
    if (!cmd) {
      addLine("input", "");
      return;
    }

    cmdHistory.value.unshift(cmd);
    historyIdx.value = -1;

    const lower = cmd.toLowerCase();
    const handler = commands[lower] ?? secretCommands[lower];
    const [name] = lower.split(/\s+/, 1);
    const argHandler = argCommands[name];
    if (handler) {
      // clear wipes lines itself — don't echo first or it flashes
      if (lower !== "clear") addLine("input", cmd);
      handler();
    } else if (argHandler) {
      addLine("input", cmd);
      argHandler(cmd.slice(name.length).trim());
    } else {
      addLine("input", cmd);
      addLine(
        "error",
        `command not found: ${cmd}  —  type "help" for available commands`
      );
      blank();
    }
  }

  // ─── tab completion ──────────────────────────────────────────────────────────
  const commandNames = Object.keys(commands);

  /** Returns all command names that start with `partial`. Pure — no side effects. */
  function getSuggestions(partial) {
    const lower = partial.toLowerCase();
    if (!lower) return [];
    return commandNames.filter((c) => c.startsWith(lower));
  }

  // ─── command history navigation ──────────────────────────────────────────────
  function historyUp(current) {
    if (!cmdHistory.value.length) return current;
    historyIdx.value = Math.min(
      historyIdx.value + 1,
      cmdHistory.value.length - 1
    );
    return cmdHistory.value[historyIdx.value];
  }

  function historyDown() {
    if (historyIdx.value <= 0) {
      historyIdx.value = -1;
      return "";
    }
    historyIdx.value--;
    return cmdHistory.value[historyIdx.value];
  }

  // ─── game menu navigation ────────────────────────────────────────────────────
  function menuUp() {
    if (!menuState.value) return;
    const len = GAME_REGISTRY.length;
    menuState.value = {
      selectedIndex: (menuState.value.selectedIndex - 1 + len) % len,
    };
  }

  function menuDown() {
    if (!menuState.value) return;
    const len = GAME_REGISTRY.length;
    menuState.value = {
      selectedIndex: (menuState.value.selectedIndex + 1) % len,
    };
  }

  /**
   * Confirms the current menu selection.
   * Returns the game id to launch, or null (coming-soon / no menu).
   */
  function menuConfirm() {
    if (!menuState.value) return null;

    const idx = menuState.value.selectedIndex;
    const game = GAME_REGISTRY[idx];

    if (game.comingSoon) {
      addLine("comment", `// ${game.label} — coming soon!`);
      blank();
      return null;
    }

    // Freeze the menu line at the confirmed selection
    const menuLine = lines.value.find((l) => l.type === "game-menu" && l.content.frozenIndex === null);
    if (menuLine) menuLine.content = { games: GAME_REGISTRY, frozenIndex: idx };

    addLine("comment", `// launching ${game.label}...`);
    blank();
    menuState.value = null;
    return game.id;
  }

  /** Cancels the open menu without launching anything. */
  function menuCancel() {
    if (!menuState.value) return;
    addLine("comment", "// cancelled");
    blank();
    menuState.value = null;
  }

  // ─── boot sequence ────────────────────────────────────────────────────────────
  /**
   * Shared boot content — used by both initial mount and `clear`.
   * Renders whoami + ls socials exactly as bradeac.dev does.
   */
  function runBoot() {
    addLine("input", "whoami");
    commands.whoami();
    addLine("input", "ls socials");
    commands["ls socials"]();
    addLine("comment", "// type \"help\" to see available commands");
    blank();
  }

  function boot() {
    runBoot();
  }

  // ─── animated scenes ─────────────────────────────────────────────────────────
  // A scene clears the terminal and types its commands out character-by-
  // character. Starting a new scene cancels the one in progress, so fast
  // scrolling between scenes never interleaves two animations.

  async function introScene({ wait, typeCommand }) {
    // ── whoami ────────────────────────────────────────────────────────
    await typeCommand("whoami");
    addLine("pair", { label: "ROLE ", value: "Fullstack Engineer" });
    await wait(70);
    addLine("pair", { label: "LOC  ", value: "Kozhikode, Kerala, India" });
    await wait(70);
    addLine("pair", { label: "STACK", value: "Vue · React · Node · Python · Docker · AWS" });
    await wait(70);
    blank();
    await wait(180);

    // ── ls socials ────────────────────────────────────────────────────
    await typeCommand("ls socials");
    addLine("comment", "// socials");
    await wait(70);
    for (const link of SOCIALS) {
      addSocial(link);
      await wait(70);
    }
    blank();
    await wait(150);

    addLine("comment", "// type \"help\" to see available commands");
    blank();
  }

  async function projectsScene({ wait, typeCommand }) {
    await typeCommand("projects");
    addLine("comment", "// projects");
    for (const project of PROJECTS) {
      await wait(140);
      addLine("project-row", project);
    }
    await wait(140);
    blank();
    addLine("comment", "// type \"help\" to see available commands");
    blank();
  }

  const SCENES = { intro: introScene, projects: projectsScene };

  /**
   * Clears the terminal and plays a scene. Resolves true if the scene ran to
   * the end, false if a newer scene cancelled it part-way.
   */
  async function playScene(name) {
    const token = ++sceneToken;
    currentScene = name;
    lines.value = [];
    menuState.value = null;
    overlay.value = null;
    booting.value = true;

    const wait = async (ms) => {
      await _delay(ms);
      if (token !== sceneToken) throw SCENE_CANCELLED;
    };

    // ── helper: type a command into a new input line ──────────────────
    async function typeCommand(cmd) {
      const lineId = uid();
      lines.value.push({ id: lineId, type: "input", content: "", cursor: true });
      for (let i = 0; i <= cmd.length; i++) {
        await wait(55);
        const idx = lines.value.findIndex((l) => l.id === lineId);
        if (idx !== -1) {
          lines.value[idx] = { id: lineId, type: "input", content: cmd.slice(0, i), cursor: i < cmd.length };
        }
      }
      await wait(220);
    }

    try {
      await SCENES[name]({ wait, typeCommand });
    } catch (err) {
      if (err !== SCENE_CANCELLED) throw err;
      return false;
    }
    booting.value = false;
    return true;
  }

  /** Plays a scene unless it's already the one showing (or playing). */
  function showScene(name) {
    if (name === currentScene) return Promise.resolve(false);
    return playScene(name);
  }

  /**
   * Animated boot — types the intro on initial page load. After the first
   * boot (e.g. navigating back to the page) the intro appears instantly.
   */
  async function bootAnimated() {
    if (_hasBooted) {
      sceneToken++;
      currentScene = "intro";
      runBoot();
      return true;
    }
    _hasBooted = true;
    return playScene("intro");
  }

  /**
   * Called when the user returns from a game.
   * Adds a contextual line so the terminal feels continuous.
   */
  function resumeFromGame(gameId) {
    const game = GAME_REGISTRY.find((g) => g.id === gameId);
    addLine("comment", `// session resumed from ${game?.label ?? gameId}`);
    blank();
  }

  return {
    lines,
    menuState,
    booting,
    overlay,
    columns,
    exitOverlay,
    execute,
    historyUp,
    historyDown,
    menuUp,
    menuDown,
    menuConfirm,
    menuCancel,
    boot,
    bootAnimated,
    showScene,
    resumeFromGame,
    getSuggestions,
  };
}
