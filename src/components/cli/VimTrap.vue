<template>
  <div ref="rootEl" class="vim absolute inset-0 flex flex-col text-sm outline-none" tabindex="0"
    role="application" aria-label="Fake vim editor. Type :q! then Enter to exit." @keydown="onKeydown"
    @click.stop="rootEl.focus()">
    <div class="flex-1 min-h-0 overflow-hidden px-2 pt-1 relative">
      <div v-for="n in 40" :key="n" class="vim-tilde leading-5">~</div>
      <div class="absolute inset-0 flex flex-col items-center justify-center text-center px-4 gap-0.5 text-white-gradient-01">
        <span>VIM - Vi IMproved</span>
        <span class="text-gray-gradient-01 text-xs pb-2">portfolio edition</span>
        <span class="text-xs">type <span class="text-accent-variable">:q&lt;Enter&gt;</span> to exit</span>
        <span class="text-xs text-gray-gradient-01">(good luck)</span>
      </div>
    </div>

    <div class="vim-status px-2 leading-6 flex justify-between text-xs">
      <span>"~/abhiram/portfolio.txt" [Modified]</span>
      <span>0,0-1 All</span>
    </div>

    <div class="px-2 leading-6 min-h-6 truncate"
      :class="messageIsError ? 'text-red-400' : 'text-white-gradient-01'">
      <template v-if="cmdline !== null">{{ cmdline }}<span class="vim-cursor" /></template>
      <template v-else-if="insertMode">-- INSERT --</template>
      <template v-else>{{ message }}</template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const emit = defineEmits(["exit"]);

const rootEl = ref(null);
const cmdline = ref(null);
const insertMode = ref(false);
const message = ref("");
const messageIsError = ref(false);
let failedAttempts = 0;

function say(text, isError = true) {
  message.value = text;
  messageIsError.value = isError;
}

function fail(text) {
  failedAttempts++;
  say(failedAttempts >= 3 ? `${text}  — psst: try :q!` : text);
}

function runCommand(raw) {
  const cmd = raw.slice(1).trim();
  if (cmd === "q!" || cmd === "qa!") {
    emit("exit");
    return;
  }
  if (cmd === "q" || cmd === "qa" || cmd === "quit") fail("E37: No write since last change (add ! to override)");
  else if (["w", "wq", "x", "wq!", "x!", "w!"].includes(cmd)) fail("E45: 'readonly' option is set (add ! to override)");
  else if (cmd === "") say("");
  else fail(`E492: Not an editor command: ${cmd}`);
}

function onKeydown(event) {
  if (event.key === "Tab" || event.metaKey || event.altKey) return;
  event.preventDefault();

  if (event.ctrlKey) {
    if (event.key === "c") say("Type  :qa!  and press <Enter> to abandon all changes and exit Vim", false);
    return;
  }

  if (cmdline.value !== null) {
    if (event.key === "Escape") cmdline.value = null;
    else if (event.key === "Enter") {
      const raw = cmdline.value;
      cmdline.value = null;
      runCommand(raw);
    } else if (event.key === "Backspace") {
      cmdline.value = cmdline.value.length > 1 ? cmdline.value.slice(0, -1) : null;
    } else if (event.key.length === 1) {
      cmdline.value += event.key;
    }
    return;
  }

  if (insertMode.value) {
    if (event.key === "Escape") insertMode.value = false;
    return;
  }

  if (event.key === ":") {
    cmdline.value = ":";
    say("");
  } else if (["i", "a", "o"].includes(event.key)) {
    insertMode.value = true;
  } else if (event.key === "Escape") {
    say("");
  }
}

onMounted(() => rootEl.value?.focus());
</script>

<style scoped>
.vim {
  background-color: var(--color-theme-main);
}

.vim-tilde {
  color: var(--color-accent-sub);
}

.vim-status {
  background-color: var(--color-border-white);
  color: var(--color-white-gradient-01);
}

.vim-cursor {
  display: inline-block;
  width: 7px;
  height: 13px;
  margin-left: 1px;
  vertical-align: middle;
  background-color: currentColor;
  animation: vim-blink 1s step-end infinite;
}

@keyframes vim-blink {
  50% {
    opacity: 0;
  }
}
</style>
