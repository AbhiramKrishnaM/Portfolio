<template>
  <div class="terminal-window flex flex-col" @click="focusInput">
    <div class="flex items-center gap-1.5 px-4 py-3 border-b border-border-white shrink-0">
      <span class="w-3 h-3 rounded-full bg-red-500 opacity-80" />
      <span class="w-3 h-3 rounded-full bg-yellow-400 opacity-80" />
      <span class="w-3 h-3 rounded-full bg-green-500 opacity-80" />
      <span class="ml-auto text-xs text-gray-gradient-01 select-none">
        abhiram@portfolio ~ $
      </span>
    </div>

    <div class="relative flex-1 min-h-0">
      <div ref="outputEl" class="h-full overflow-y-auto px-4 py-3 scrollbar-thin">
        <TerminalOutput :lines="lines" :menu-state="menuState" :selected-project="selectedProject"
          @project-select="emit('project-select', $event)" />

        <div v-if="!booting && !overlay">
          <div class="flex items-center gap-2 mt-1">
            <span class="text-accent-variable text-sm select-none">$</span>
            <input ref="inputRef" v-model="inputValue" type="text" autocomplete="off" autocorrect="off" spellcheck="false"
              class="flex-1 bg-transparent outline-none text-white-gradient-01 text-sm caret-accent-variable"
              @keydown="handleKeydown" />
          </div>

          <div v-if="tabSuggestions.length" class="pl-5 pt-1 flex flex-wrap gap-x-3 gap-y-1">
            <span
              v-for="(cmd, i) in tabSuggestions"
              :key="cmd"
              class="text-sm px-1.5 py-0.5 rounded transition-colors duration-100"
              :class="i === tabIndex
                ? 'bg-accent-variable text-theme-main font-semibold'
                : 'text-gray-gradient-01'"
            >
              {{ cmd }}
            </span>
          </div>
        </div>
      </div>

      <MatrixRain v-if="overlay === 'matrix'" @exit="onOverlayExit" />
      <VimTrap v-else-if="overlay === 'vim'" @exit="onOverlayExit" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted } from "vue";
import { useCLI } from "@/composables/cli/useCLI.js";
import { useTabCompletion } from "@/composables/cli/useTabCompletion.js";
import { introDone } from "@/composables/introGate.js";
import { emitKeystroke } from "@/composables/typingBus.js";
import TerminalOutput from "./TerminalOutput.vue";
import MatrixRain from "./MatrixRain.vue";
import VimTrap from "./VimTrap.vue";

const CHAR_WIDTH_PX = 7.2;
const OUTPUT_INSET_PX = 52;
const MIN_COLUMNS = 20;
const SCENE_SWITCH_DEBOUNCE_MS = 150;

const props = defineProps({
  scene: {
    type: String,
    default: "intro",
  },
  selectedProject: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(["game-selected", "project-select"]);

const {
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
  bootAnimated,
  showScene,
  resumeFromGame,
  getSuggestions,
} = useCLI();

const {
  suggestions: tabSuggestions,
  activeIndex: tabIndex,
  clear: clearTab,
  next: nextCompletion,
  highlighted: highlightedCompletion,
} = useTabCompletion(getSuggestions);

const inputValue = ref("");
const outputEl = ref(null);
const inputRef = ref(null);

function onGameExit(gameId) {
  resumeFromGame(gameId);
  nextTick(() => {
    scrollToBottom();
    focusInput();
  });
}

defineExpose({ onGameExit });

function submit(cmd) {
  inputValue.value = "";
  execute(cmd);
  nextTick(scrollToBottom);
  focusWhenIdle();
}

function handleMenuKey(event) {
  if (event.key === "ArrowUp") {
    event.preventDefault();
    menuUp();
  } else if (event.key === "ArrowDown") {
    event.preventDefault();
    menuDown();
  } else if (event.key === "Enter") {
    event.preventDefault();
    const gameId = menuConfirm();
    nextTick(scrollToBottom);
    if (gameId) emit("game-selected", gameId);
  } else if (event.key === "Escape") {
    event.preventDefault();
    menuCancel();
    nextTick(scrollToBottom);
  }
}

function handleTabKey(event) {
  event.preventDefault();
  const completion = nextCompletion(inputValue.value.trim(), event.shiftKey);
  if (completion === null) return;
  inputValue.value = completion;
  if (tabSuggestions.value.length) nextTick(scrollToBottom);
}

function handlePickerKey(event) {
  if (event.key === "Escape") {
    event.preventDefault();
    clearTab();
    return true;
  }
  if (event.key === "Enter") {
    event.preventDefault();
    const cmd = highlightedCompletion();
    clearTab();
    submit(cmd);
    return true;
  }
  clearTab();
  return false;
}

function handlePromptKey(event) {
  if (event.key === "ArrowUp") {
    event.preventDefault();
    inputValue.value = historyUp(inputValue.value);
  } else if (event.key === "ArrowDown") {
    event.preventDefault();
    inputValue.value = historyDown();
  } else if (event.key === "Enter") {
    submit(inputValue.value);
  }
}

function handleKeydown(event) {
  emitKeystroke(event.key);
  const isTypedCommand = event.key === "Enter" && inputValue.value.trim();
  if (menuState.value && !isTypedCommand) {
    handleMenuKey(event);
    return;
  }
  if (event.key === "Tab") {
    handleTabKey(event);
    return;
  }
  if (tabSuggestions.value.length && handlePickerKey(event)) return;
  handlePromptKey(event);
}

function onOverlayExit() {
  exitOverlay();
  nextTick(() => {
    scrollToBottom();
    focusInput();
  });
}

function measureColumns() {
  if (!outputEl.value) return;
  columns.value = Math.max(MIN_COLUMNS, Math.floor((outputEl.value.clientWidth - OUTPUT_INSET_PX) / CHAR_WIDTH_PX));
}

function focusWhenIdle() {
  if (!booting.value) return;
  const stop = watch(booting, (busy) => {
    if (busy) return;
    stop();
    nextTick(() => inputRef.value?.focus({ preventScroll: true }));
  });
}

function focusInput() {
  inputRef.value?.focus();
}

function scrollToBottom() {
  if (outputEl.value) {
    outputEl.value.scrollTop = outputEl.value.scrollHeight;
  }
}

watch(lines, () => nextTick(scrollToBottom), { deep: true });

let sceneTimer = null;
watch(() => props.scene, (scene) => {
  clearTimeout(sceneTimer);
  sceneTimer = setTimeout(() => showScene(scene), SCENE_SWITCH_DEBOUNCE_MS);
});

onMounted(() => {
  measureColumns();
  window.addEventListener("resize", measureColumns);
  introDone.then(() => {
    const start = props.scene === "intro" ? bootAnimated() : showScene(props.scene);
    start.then(() => {
      nextTick(() => focusInput());
    });
  });
});

onUnmounted(() => {
  clearTimeout(sceneTimer);
  window.removeEventListener("resize", measureColumns);
});
</script>

<style scoped>
.terminal-window {
  width: 100%;
  height: 420px;
  background: linear-gradient(150deg,
      rgba(1, 22, 39, 0.95) 0%,
      rgba(1, 18, 33, 0.98) 100%);
  border: 1px solid var(--color-border-white);
  border-radius: 8px;
  cursor: text;
  overflow: hidden;
  transition: background 0.3s ease, border-color 0.3s ease;
}

:root[data-theme="light"] .terminal-window {
  background: linear-gradient(150deg,
      rgba(255, 255, 255, 0.97) 0%,
      rgba(239, 244, 248, 0.98) 100%);
  box-shadow: 0px 12px 32px rgba(11, 32, 54, 0.1);
}

@media (min-width: 1024px) {
  .terminal-window {
    width: 500px;
    height: 460px;
  }
}

@media (min-width: 1280px) {
  .terminal-window {
    width: 580px;
    height: 480px;
  }
}

@media (min-width: 1536px) {
  .terminal-window {
    width: 660px;
    height: 500px;
  }
}
</style>
