<template>
  <div ref="cursorRef" class="custom-cursor" :class="{ 'cursor-hidden': !visible }">
    <svg class="cursor-arrow" viewBox="0 0 24 24">
      <path
        d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z"
        fill="#0B1220"
        stroke="white"
        stroke-width="1"
        stroke-linejoin="round"
      />
    </svg>

    <Transition name="cursor-label-fade">
      <span v-if="label" class="cursor-label">{{ label }}</span>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const cursorRef = ref(null);
const visible = ref(false);
const label = ref("");

function handleMove(e) {
  if (cursorRef.value) {
    cursorRef.value.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  }
  if (!visible.value) visible.value = true;

  const target = e.target instanceof Element ? e.target.closest("[data-cursor]") : null;
  const next = target ? target.getAttribute("data-cursor") : "";
  if (next !== label.value) label.value = next;
}

function handleLeaveWindow() {
  visible.value = false;
}

onMounted(() => {
  document.body.classList.add("custom-cursor-active");
  window.addEventListener("mousemove", handleMove);
  document.documentElement.addEventListener("mouseleave", handleLeaveWindow);
});

onUnmounted(() => {
  document.body.classList.remove("custom-cursor-active");
  window.removeEventListener("mousemove", handleMove);
  document.documentElement.removeEventListener("mouseleave", handleLeaveWindow);
});
</script>

<style>
/* Unscoped: needs to reach every element while the cursor is active. */
body.custom-cursor-active,
body.custom-cursor-active * {
  cursor: none !important;
}
</style>

<style scoped>
.custom-cursor {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  pointer-events: none;
  display: flex;
  align-items: flex-start;
  opacity: 1;
  transition: opacity 0.15s ease;
  will-change: transform;
}

.cursor-hidden {
  opacity: 0;
}

.cursor-arrow {
  width: 22px;
  height: 22px;
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.45));
}

.cursor-label {
  margin-top: 16px;
  margin-left: 2px;
  background: #011627;
  color: white;
  font-size: 0.7rem;
  padding: 0.3rem 0.55rem;
  border-radius: 0.5rem;
  border: 1px solid #1e2d3d;
  white-space: nowrap;
  box-shadow: 0px 6px 16px rgba(0, 0, 0, 0.4);
}

.cursor-label-fade-enter-active,
.cursor-label-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.cursor-label-fade-enter-from,
.cursor-label-fade-leave-to {
  opacity: 0;
  transform: translateX(-4px);
}
</style>
