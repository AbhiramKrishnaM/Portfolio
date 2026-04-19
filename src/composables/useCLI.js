/**
 * useCLI — command registry, output history, and menu state.
 *
 * To add a new command:   add a key + handler to `commands` below.
 * To add a new game:      add an entry to GAME_REGISTRY below.
 */

import { ref } from "vue";

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
    comingSoon: true,
    githubUrl: null,
  },
  {
    id: "tetris",
    label: "_tetris",
    description: "block stacking",
    comingSoon: true,
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

  /** Command input history (most recent first). */
  const cmdHistory = ref([]);
  const historyIdx = ref(-1);

  // ─── line helpers ────────────────────────────────────────────────────────────
  const addLine = (type, content) =>
    lines.value.push({ id: uid(), type, content });
  const blank = () => addLine("blank", null);

  // ─── command registry ────────────────────────────────────────────────────────
  // Add a new command by adding a key here. Value must be () => void.
  const commands = {
    whoami() {
      addLine("pair", { label: "ROLE ", value: "Full-Stack Developer" });
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
      addLine("link", {
        text: "github",
        url: "https://github.com/AbhiramKrishnaM",
      });
      addLine("link", { text: "linkedin", url: "https://www.linkedin.com/in/abhiram-krishna/" });
      addLine("link", { text: "dinq", url: "https://dinq.me/abhiramkrishna" });
      addLine("link", {
        text: "email",
        url: "mailto:abhiramkrishna.8921@gmail.com",
      });
      addLine("link", {
        text: "send me a message",
        url: "/contact",
        note: "// coming soon",
      });
      blank();
    },

    "ls projects"() {
      addLine("comment", "// projects — coming soon");
      blank();
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

    contact() {
      addLine("comment", "// get in touch");
      addLine("link", { text: "linkedin", url: "https://www.linkedin.com/in/abhiram-krishna/" });
      addLine("link", { text: "dinq", url: "https://dinq.me/admin/mydinq?domain=abhiramkrishna" });
      addLine("link", { text: "email", url: "mailto:abhiramkrishna.8921@gmail.com" });
      addLine("link", { text: "send me a message", url: "/contact", note: "// coming soon" });
      blank();
    },

    help() {
      addLine("comment", "Available commands:");
      addLine("help-row", { cmd: "ls projects", desc: "list projects" });
      addLine("help-row", { cmd: "ls blog", desc: "list blog posts" });
      addLine("help-row", { cmd: "ls socials", desc: "list social links" });
      addLine("help-row", { cmd: "cd projects", desc: "go to projects" });
      addLine("help-row", { cmd: "cd blog", desc: "go to blog" });
      addLine("help-row", { cmd: "cd home", desc: "go home" });
      addLine("help-row", { cmd: "cat cv", desc: "quick CV overview" });
      addLine("help-row", { cmd: "cd cv", desc: "view full CV" });
      addLine("help-row", { cmd: "whoami", desc: "who am I?" });
      addLine("help-row", { cmd: "contact", desc: "get in touch" });
      addLine("help-row", { cmd: "/game", desc: "launch a mini-game" });
      addLine("help-row", { cmd: "clear", desc: "clear terminal" });
      addLine("help-row", { cmd: "help", desc: "show this message" });
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
      runBoot();
    },
  };

  // ─── execute a raw command string ────────────────────────────────────────────
  function execute(raw) {
    const cmd = raw.trim();
    if (!cmd) {
      addLine("input", "");
      return;
    }

    cmdHistory.value.unshift(cmd);
    historyIdx.value = -1;

    const handler = commands[cmd.toLowerCase()];
    if (handler) {
      // clear wipes lines itself — don't echo first or it flashes
      if (cmd.toLowerCase() !== "clear") addLine("input", cmd);
      handler();
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
    addLine("comment", '// type "help" to see available commands');
    blank();
  }

  function boot() {
    runBoot();
  }

  /**
   * Animated boot — types each command character-by-character,
   * then staggers the output lines. Used on initial page load.
   */
  async function bootAnimated() {
    if (_hasBooted) {
      runBoot();
      return;
    }
    _hasBooted = true;
    booting.value = true;

    // ── helper: type a command into a new input line ──────────────────
    async function typeCommand(cmd) {
      const lineId = uid();
      lines.value.push({ id: lineId, type: "input", content: "", cursor: true });
      for (let i = 0; i <= cmd.length; i++) {
        await _delay(55);
        const idx = lines.value.findIndex((l) => l.id === lineId);
        if (idx !== -1) {
          lines.value[idx] = { id: lineId, type: "input", content: cmd.slice(0, i), cursor: i < cmd.length };
        }
      }
      await _delay(220);
    }

    // ── whoami ────────────────────────────────────────────────────────
    await typeCommand("whoami");
    addLine("pair", { label: "ROLE ", value: "Full-Stack Developer" });
    await _delay(70);
    addLine("pair", { label: "LOC  ", value: "Kozhikode, Kerala, India" });
    await _delay(70);
    addLine("pair", { label: "STACK", value: "Vue · React · Node · Python · Docker · AWS" });
    await _delay(70);
    blank();
    await _delay(180);

    // ── ls socials ────────────────────────────────────────────────────
    await typeCommand("ls socials");
    addLine("comment", "// socials");
    await _delay(70);
    addLine("link", { text: "github", url: "https://github.com/AbhiramKrishnaM" });
    await _delay(70);
    addLine("link", { text: "linkedin", url: "https://www.linkedin.com/in/abhiram-krishna/" });
    await _delay(70);
    addLine("link", { text: "dinq", url: "https://dinq.me/admin/mydinq?domain=abhiramkrishna" });
    await _delay(70);
    addLine("link", { text: "email", url: "mailto:abhiramkrishna.8921@gmail.com" });
    await _delay(70);
    addLine("link", { text: "send me a message", url: "/contact", note: "// coming soon" });
    await _delay(70);
    blank();
    await _delay(150);

    addLine("comment", "// type \"help\" to see available commands");
    blank();

    booting.value = false;
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
    execute,
    historyUp,
    historyDown,
    menuUp,
    menuDown,
    menuConfirm,
    menuCancel,
    boot,
    bootAnimated,
    resumeFromGame,
    getSuggestions,
  };
}
