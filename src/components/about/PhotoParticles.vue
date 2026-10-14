<template>
  <div ref="rootRef" class="portrait terminal-panel" :class="{ 'portrait--particles': particlesReady }" role="img" aria-label="Portrait of Abhiram Krishna M">
    <img v-if="!particlesReady" :src="PORTRAIT_URL" alt="" class="portrait-fallback" loading="lazy" decoding="async" />
    <canvas v-show="particlesReady" ref="canvasRef" class="portrait-canvas" data-cursor="scatter me" />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from "vue";
import { useTheme } from "@/composables/useTheme.js";
import { prefersReducedMotion } from "@/composables/storyline.js";

const PORTRAIT_URL = "/images/portrait.png";
const DESKTOP_QUERY = "(min-width: 1024px) and (pointer: fine)";

const rootRef = ref(null);
const canvasRef = ref(null);
const particlesReady = ref(false);
const { theme } = useTheme();

let particles = null;
let frameId = null;
let observer = null;
let resizeObserver = null;
let visible = false;
let animate = true;

function cssVar(name, fallback) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

function applyColors() {
  particles?.setColors({
    dim: cssVar("--color-accent-color", "#607b96"),
    lit: cssVar("--color-accent-variable", "#43d9ad"),
    additive: false,
  });
}

function onPointerMove(e) {
  const rect = canvasRef.value.getBoundingClientRect();
  particles?.setPointer((e.clientX - rect.left) / rect.width, (e.clientY - rect.top) / rect.height, true);
}

function onPointerLeave() {
  particles?.setPointer(0, 0, false);
}

function tick(now) {
  frameId = requestAnimationFrame(tick);
  if (!visible || !particles) return;
  particles.step(now / 1000, animate);
}

function onResize() {
  const rect = rootRef.value.getBoundingClientRect();
  particles?.resize(rect.width, rect.height);
}

async function start() {
  if (particles) return;
  const { createPhotoParticles } = await import("./photoParticles.js");
  try {
    particles = await createPhotoParticles(canvasRef.value, PORTRAIT_URL);
  } catch {
    return;
  }
  animate = !prefersReducedMotion();
  onResize();
  applyColors();
  particlesReady.value = true;
  resizeObserver = new ResizeObserver(onResize);
  resizeObserver.observe(rootRef.value);
  canvasRef.value.addEventListener("pointermove", onPointerMove);
  canvasRef.value.addEventListener("pointerleave", onPointerLeave);
  frameId = requestAnimationFrame(tick);
}

watch(theme, () => requestAnimationFrame(applyColors));

onMounted(() => {
  if (!window.matchMedia(DESKTOP_QUERY).matches) return;
  observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) start();
  }, { rootMargin: "200px" });
  observer.observe(rootRef.value);
});

onUnmounted(() => {
  cancelAnimationFrame(frameId);
  observer?.disconnect();
  resizeObserver?.disconnect();
  canvasRef.value?.removeEventListener("pointermove", onPointerMove);
  canvasRef.value?.removeEventListener("pointerleave", onPointerLeave);
  particles?.dispose();
});
</script>

<style scoped>
.portrait {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
}

.portrait-canvas,
.portrait-fallback {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.portrait-fallback {
  object-fit: cover;
  filter: grayscale(1) brightness(1.05);
}

.portrait::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: var(--color-accent-variable);
  mix-blend-mode: color;
  opacity: 0.85;
}

.portrait--particles::after {
  display: none;
}
</style>
