<template>
  <div class="terminal-window flex flex-col" @click="focusInput">
    <!-- ── macOS-style chrome bar ──────────────────────────────────────── -->
    <div class="flex items-center gap-1.5 px-4 py-3 border-b border-border-white shrink-0">
      <span class="w-3 h-3 rounded-full bg-red-500 opacity-80" />
      <span class="w-3 h-3 rounded-full bg-yellow-400 opacity-80" />
      <span class="w-3 h-3 rounded-full bg-green-500 opacity-80" />
      <span class="ml-auto text-xs text-gray-gradient-01 select-none">
        abhiram@portfolio ~ $
      </span>
    </div>

    <!-- ── scrollable output + inline input ───────────────────────────── -->
    <div ref="outputEl" class="flex-1 overflow-y-auto px-4 py-3 scrollbar-thin min-h-0">
      <TerminalOutput :lines="lines" :menu-state="menuState" />

      <!-- Inline active $ prompt — hidden while boot animation runs -->
      <div v-if="!booting" class="flex items-center gap-2 mt-1">
        <span class="text-accent-variable text-sm select-none">$</span>
        <input ref="inputRef" v-model="inputValue" type="text" autocomplete="off" autocorrect="off" spellcheck="false"
          class="flex-1 bg-transparent outline-none text-white-gradient-01 text-sm caret-accent-variable"
          @keydown="handleKeydown" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from "vue";
import { useCLI } from "@/composables/useCLI.js";
import TerminalOutput from "./TerminalOutput.vue";

const emit = defineEmits(["game-selected"]);

const {
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
  bootAnimated,
  resumeFromGame,
  tabComplete,
} = useCLI();

const inputValue = ref("");
const outputEl = ref(null);
const inputRef = ref(null);

// ─── public API ───────────────────────────────────────────────────────────────
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
  // ── menu mode ────────────────────────────────────────────────────────
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

  // ── normal mode ──────────────────────────────────────────────────────
  if (event.key === "Tab") {
    event.preventDefault();
    if (!inputValue.value.trim()) return;
    const { completed } = tabComplete(inputValue.value);
    if (completed !== null) inputValue.value = completed;
    nextTick(scrollToBottom);
  } else if (event.key === "ArrowUp") {
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

function focusInput() {
  inputRef.value?.focus();
}

function scrollToBottom() {
  if (outputEl.value) {
    outputEl.value.scrollTop = outputEl.value.scrollHeight;
  }
}

// Auto-scroll as lines are added during the boot animation
watch(lines, () => nextTick(scrollToBottom), { deep: true });

onMounted(() => {
  bootAnimated().then(() => {
    nextTick(() => focusInput());
  });
});
</script>

<style scoped>
.terminal-window {
  width: 660px;
  height: 500px;
  background: linear-gradient(150deg,
      rgba(1, 22, 39, 0.95) 0%,
      rgba(1, 18, 33, 0.98) 100%);
  border: 1px solid #1e2d3d;
  border-radius: 8px;
  cursor: text;
  overflow: hidden;
}
</style>
