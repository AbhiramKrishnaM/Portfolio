<template>
  <div class="fixed z-[60] top-4 right-4 left-4 sm:left-auto sm:top-auto sm:bottom-6 sm:right-6 flex justify-end pointer-events-none"
    role="status" aria-live="polite">
    <Transition name="toast">
      <button v-if="current" :key="current.key" type="button"
        class="achievement-toast pointer-events-auto w-full sm:w-80 text-left flex flex-col gap-1 px-4 py-3"
        data-cursor="dismiss" @click="dismiss">
        <span class="text-xs text-accent-variable">// achievement unlocked</span>
        <span class="text-sm text-white-gradient-01 font-medium">{{ current.name }}</span>
        <span class="text-xs text-gray-gradient-01">{{ current.desc }}</span>
      </button>
    </Transition>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted } from "vue";
import { toastQueue } from "@/composables/achievements.js";

const DISPLAY_MS = 3500;
const GAP_MS = 250;

const current = ref(null);
let timer = null;

function showNext() {
  if (current.value || !toastQueue.value.length) return;
  current.value = toastQueue.value.shift();
  timer = setTimeout(dismiss, DISPLAY_MS);
}

function dismiss() {
  clearTimeout(timer);
  current.value = null;
  timer = setTimeout(showNext, GAP_MS);
}

watch(() => toastQueue.value.length, showNext, { immediate: true });

onUnmounted(() => clearTimeout(timer));
</script>

<style scoped>
.achievement-toast {
  background: linear-gradient(150deg,
      rgba(1, 22, 39, 0.97) 0%,
      rgba(1, 18, 33, 0.99) 100%);
  border: 1px solid var(--color-border-white);
  border-left: 3px solid var(--color-accent-variable);
  border-radius: 8px;
  box-shadow: 0px 16px 32px rgba(0, 0, 0, 0.35);
}

:root[data-theme="light"] .achievement-toast {
  background: linear-gradient(150deg,
      rgba(255, 255, 255, 0.98) 0%,
      rgba(239, 244, 248, 0.99) 100%);
  box-shadow: 0px 12px 28px rgba(11, 32, 54, 0.16);
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
