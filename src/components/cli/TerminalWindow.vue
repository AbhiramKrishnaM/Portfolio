<template>
  <div
    class="terminal-window flex flex-col"
    @click="focusInput"
  >
    <!-- ── macOS-style chrome bar ──────────────────────────────────────── -->
    <div class="flex items-center gap-1.5 px-4 py-3 border-b border-border-white shrink-0">
      <span class="w-3 h-3 rounded-full bg-red-500 opacity-80" />
      <span class="w-3 h-3 rounded-full bg-yellow-400 opacity-80" />
      <span class="w-3 h-3 rounded-full bg-green-500 opacity-80" />
      <span class="ml-auto text-xs text-gray-gradient-01 select-none">
        abhiram@portfolio ~ $
      </span>
    </div>

    <!-- ── scrollable output ───────────────────────────────────────────── -->
    <div
      ref="outputEl"
      class="flex-1 overflow-y-auto px-4 py-3 scrollbar-thin min-h-0"
    >
      <TerminalOutput :lines="lines" :menu-state="menuState" />

      <!-- blinking cursor when no menu is active -->
      <div v-if="!menuState" class="flex items-center gap-2 mt-1">
        <span class="text-accent-variable text-sm">$</span>
        <span class="terminal-cursor" />
      </div>
    </div>

    <!-- ── input bar ───────────────────────────────────────────────────── -->
    <TerminalInput
      ref="inputRef"
      v-model="inputValue"
      @keydown="handleKeydown"
    />
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from "vue";
import { useCLI } from "@/composables/useCLI.js";
import TerminalOutput from "./TerminalOutput.vue";
import TerminalInput from "./TerminalInput.vue";

// ─── emits ──────────────────────────────────────────────────────────────────
const emit = defineEmits(["game-selected"]);

// ─── composable ──────────────────────────────────────────────────────────────
const {
  lines,
  menuState,
  execute,
  historyUp,
  historyDown,
  menuUp,
  menuDown,
  menuConfirm,
  menuCancel,
  boot,
  resumeFromGame,
} = useCLI();

// ─── refs ─────────────────────────────────────────────────────────────────────
const inputValue = ref("");
const outputEl = ref(null);
const inputRef = ref(null);

// ─── public API ───────────────────────────────────────────────────────────────
/**
 * Called by the parent (index.vue) when the user exits a game.
 * Adds a "session resumed" line and re-focuses the input.
 */
function onGameExit(gameId) {
  resumeFromGame(gameId);
  nextTick(() => {
    scrollToBottom();
    focusInput();
  });
}

defineExpose({ onGameExit });

// ─── keyboard handler ─────────────────────────────────────────────────────────
function handleKeydown(event) {
  // ── game menu is open: arrows + enter + esc control the menu ──
  if (menuState.value) {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      menuUp();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      menuDown();
    } else if (event.key === "Enter") {
      event.preventDefault();
      const gameId = menuConfirm();
      if (gameId) {
        nextTick(scrollToBottom);
        emit("game-selected", gameId);
      } else {
        nextTick(scrollToBottom);
      }
    } else if (event.key === "Escape") {
      event.preventDefault();
      menuCancel();
      nextTick(scrollToBottom);
    }
    return;
  }

  // ── normal mode ──────────────────────────────────────────────────
  if (event.key === "ArrowUp") {
    event.preventDefault();
    inputValue.value = historyUp(inputValue.value);
  } else if (event.key === "ArrowDown") {
    event.preventDefault();
    inputValue.value = historyDown();
  } else if (event.key === "Enter") {
    const cmd = inputValue.value;
    inputValue.value = "";
    execute(cmd);
    nextTick(scrollToBottom);
  }
}

// ─── helpers ──────────────────────────────────────────────────────────────────
function focusInput() {
  inputRef.value?.focus();
}

function scrollToBottom() {
  if (outputEl.value) {
    outputEl.value.scrollTop = outputEl.value.scrollHeight;
  }
}

// ─── lifecycle ────────────────────────────────────────────────────────────────
onMounted(() => {
  boot();
  nextTick(() => {
    scrollToBottom();
    focusInput();
  });
});
</script>

<style scoped>
.terminal-window {
  width: 480px;
  height: 475px;
  background: linear-gradient(
    150deg,
    rgba(1, 22, 39, 0.95) 0%,
    rgba(1, 18, 33, 0.98) 100%
  );
  border: 1px solid #1e2d3d;
  border-radius: 8px;
  box-shadow:
    0px 2px 0px 0px rgba(255, 255, 255, 0.08) inset,
    0 20px 60px rgba(0, 0, 0, 0.5);
  cursor: text;
  overflow: hidden;
}

.terminal-cursor {
  display: inline-block;
  width: 8px;
  height: 14px;
  background-color: #43d9ad;
  animation: blink 1.1s step-end infinite;
  vertical-align: middle;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}
</style>
