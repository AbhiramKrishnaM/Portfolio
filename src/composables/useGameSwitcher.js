import { ref, computed, watch, nextTick } from "vue";
import { GAME_REGISTRY } from "@/data/games.js";
import { pendingGame } from "@/composables/commandPalette.js";

const DESKTOP_MIN_WIDTH = 1024;

export function useGameSwitcher({ terminalRef, panelRef }) {
  const view = ref("cli");
  const activeGame = ref(null);

  const activeGameGithubUrl = computed(() => {
    if (!activeGame.value) return null;
    return GAME_REGISTRY.find((g) => g.id === activeGame.value)?.githubUrl ?? null;
  });

  function launchGame(gameId) {
    activeGame.value = gameId;
    view.value = "game";
  }

  function exitGame() {
    const previousGame = activeGame.value;
    view.value = "cli";
    activeGame.value = null;
    nextTick(() => {
      terminalRef.value?.onGameExit(previousGame);
    });
  }

  watch(pendingGame, (gameId) => {
    if (!gameId) return;
    pendingGame.value = null;
    launchGame(gameId);
    if (window.innerWidth < DESKTOP_MIN_WIDTH) {
      panelRef.value?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, { immediate: true });

  return { view, activeGame, activeGameGithubUrl, launchGame, exitGame };
}
