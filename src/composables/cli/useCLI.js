import { ref } from "vue";
import { GAME_REGISTRY } from "@/data/games.js";
import { unlock, recordCommand, recordSecret } from "@/composables/achievements.js";
import { createTerminalState } from "./terminalState.js";
import { createScenes } from "./scenes.js";
import { createCommands } from "./commands.js";
import { createHiddenCommands } from "./hiddenCommands.js";

export function useCLI() {
  const term = createTerminalState();
  const { lines, menuState, booting, overlay, columns, addLine, blank } = term;
  const scenes = createScenes(term);
  const commands = createCommands(term, scenes);
  const { secretCommands, argCommands, isVimAlias } = createHiddenCommands(term, scenes);

  const cmdHistory = ref([]);
  const historyIdx = ref(-1);

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
      if (lower !== "clear") addLine("input", cmd);
      recordCommand(lower);
      if (secretCommands[lower]) recordSecret(lower);
      handler();
    } else if (argHandler) {
      const canonical = isVimAlias(name) ? "vim" : name;
      addLine("input", cmd);
      recordCommand(canonical);
      recordSecret(canonical);
      argHandler(cmd.slice(name.length).trim());
    } else {
      addLine("input", cmd);
      addLine("error", `command not found: ${cmd}  —  type "help" for available commands`);
      blank();
    }
  }

  const commandNames = Object.keys(commands);

  function getSuggestions(partial) {
    const lower = partial.toLowerCase();
    if (!lower) return [];
    return commandNames.filter((c) => c.startsWith(lower));
  }

  function historyUp(current) {
    if (!cmdHistory.value.length) return current;
    historyIdx.value = Math.min(historyIdx.value + 1, cmdHistory.value.length - 1);
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

  function moveMenuSelection(step) {
    if (!menuState.value) return;
    const len = GAME_REGISTRY.length;
    menuState.value = { selectedIndex: (menuState.value.selectedIndex + step + len) % len };
  }

  const menuUp = () => moveMenuSelection(-1);
  const menuDown = () => moveMenuSelection(1);

  function menuConfirm() {
    if (!menuState.value) return null;

    const idx = menuState.value.selectedIndex;
    const game = GAME_REGISTRY[idx];

    if (game.comingSoon) {
      addLine("comment", `// ${game.label} — coming soon!`);
      blank();
      return null;
    }

    const menuLine = lines.value.find((l) => l.type === "game-menu" && l.content.frozenIndex === null);
    if (menuLine) menuLine.content = { games: GAME_REGISTRY, frozenIndex: idx };

    addLine("comment", `// launching ${game.label}...`);
    blank();
    menuState.value = null;
    return game.id;
  }

  function menuCancel() {
    if (!menuState.value) return;
    addLine("comment", "// cancelled");
    blank();
    menuState.value = null;
  }

  function exitOverlay() {
    const kind = overlay.value;
    overlay.value = null;
    if (kind === "vim") {
      unlock("escape-vim");
      addLine("comment", "// you escaped vim. put that on your resume.");
    }
    if (kind === "matrix") addLine("comment", "// welcome back to the real world.");
    blank();
  }

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
    bootAnimated: scenes.bootAnimated,
    showScene: scenes.showScene,
    resumeFromGame,
    getSuggestions,
  };
}
