<template>
  <button
    type="button"
    v-show="atTop"
    class="scroll-cue hidden sm:flex"
    data-cursor="scroll down"
    aria-label="Scroll to explore more"
    @click="scrollToNext"
  >
    <span class="scroll-cue-text">// scroll</span>
    <svg
      class="scroll-cue-chevron"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  </button>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { scrollToSection } from "@/composables/useNavLinks.js";

const HIDE_AFTER_VIEWPORT_FRACTION = 0.3;

const atTop = ref(true);

function syncVisibility() {
  atTop.value = window.scrollY < window.innerHeight * HIDE_AFTER_VIEWPORT_FRACTION;
}

function scrollToNext() {
  if (!scrollToSection("projects")) scrollToSection("experience");
}

onMounted(() => {
  syncVisibility();
  window.addEventListener("scroll", syncVisibility, { passive: true });
});

onUnmounted(() => window.removeEventListener("scroll", syncVisibility));
</script>

<style scoped>
.scroll-cue {
  position: fixed;
  z-index: 20;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  background: none;
  border: none;
  padding: 0;
  color: var(--color-accent-variable);
  font-family: inherit;
  cursor: pointer;
}

.scroll-cue-text {
  font-size: 0.8rem;
  letter-spacing: 0.02em;
  color: var(--color-gray-gradient-01);
}

.scroll-cue-chevron {
  width: 1.1rem;
  height: 1.1rem;
  animation: scroll-cue-bounce 1.8s ease-in-out infinite;
}

@keyframes scroll-cue-bounce {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.6;
  }
  50% {
    transform: translateY(6px);
    opacity: 1;
  }
}
</style>
