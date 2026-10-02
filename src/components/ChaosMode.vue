<template>
  <canvas v-if="active" ref="canvasEl" class="fixed inset-0 z-[70] pointer-events-none w-full h-full" aria-hidden="true" />
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted } from "vue";
import { unlock } from "@/composables/achievements.js";

const KONAMI = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];
const CHAOS_MS = 4000;
const PARTICLE_COUNT = 160;
const GRAVITY = 0.12;
const ACCENT_VARS = ["--color-accent-url", "--color-accent-variable", "--color-accent-sub", "--color-accent-underline"];

const active = ref(false);
const canvasEl = ref(null);
let recentKeys = [];
let rafId = null;
let endTimer = null;

function onKeydown(event) {
  recentKeys = [...recentKeys, event.key.toLowerCase()].slice(-KONAMI.length);
  if (recentKeys.join() === KONAMI.join()) {
    recentKeys = [];
    startChaos();
  }
}

function startChaos() {
  unlock("konami");
  if (active.value || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  active.value = true;
  document.documentElement.classList.add("chaos-mode");
  nextTick(runConfetti);
  endTimer = setTimeout(stopChaos, CHAOS_MS);
}

function stopChaos() {
  cancelAnimationFrame(rafId);
  document.documentElement.classList.remove("chaos-mode");
  active.value = false;
}

function runConfetti() {
  const canvas = canvasEl.value;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  const styles = getComputedStyle(document.documentElement);
  const colors = ACCENT_VARS.map((v) => styles.getPropertyValue(v).trim()).filter(Boolean);
  const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
    x: width / 2 + (Math.random() - 0.5) * width * 0.3,
    y: height * 0.35,
    vx: (Math.random() - 0.5) * 14,
    vy: -Math.random() * 12 - 4,
    size: Math.random() * 6 + 4,
    angle: Math.random() * Math.PI,
    spin: (Math.random() - 0.5) * 0.3,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));

  const frame = () => {
    ctx.clearRect(0, 0, width, height);
    for (const p of particles) {
      p.vy += GRAVITY;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.angle += p.spin;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx.restore();
    }
    rafId = requestAnimationFrame(frame);
  };
  rafId = requestAnimationFrame(frame);
}

onMounted(() => window.addEventListener("keydown", onKeydown));

onUnmounted(() => {
  window.removeEventListener("keydown", onKeydown);
  clearTimeout(endTimer);
  stopChaos();
});
</script>

<style>
html.chaos-mode {
  animation: chaos-hue 1s linear infinite;
}

@keyframes chaos-hue {
  from {
    filter: hue-rotate(0deg);
  }

  to {
    filter: hue-rotate(360deg);
  }
}
</style>
