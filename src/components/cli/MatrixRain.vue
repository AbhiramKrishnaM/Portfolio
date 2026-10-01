<template>
  <div class="matrix absolute inset-0 overflow-hidden" role="img" aria-label="Falling green code, like The Matrix. Press any key to exit."
    @click.stop="emit('exit')">
    <canvas ref="canvasEl" class="block w-full h-full" />
    <p class="matrix-hint absolute bottom-2 right-3 text-xs text-gray-gradient-01">// press any key to exit</p>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const emit = defineEmits(["exit"]);

const canvasEl = ref(null);
const FONT_SIZE = 14;
const FRAME_MS = 50;
const GLYPHS = "アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEF<>{}[]/$#*+=";

let rafId = null;
let lastFrame = 0;
// The Enter that ran `matrix` is still bubbling up to window when this mounts —
// ignore anything that happened before we appeared.
let mountedAt = Infinity;

const glyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

/** Theme colors come from CSS custom properties so light/dark both work. */
function themeColors() {
  const styles = getComputedStyle(document.documentElement);
  const bg = styles.getPropertyValue("--color-theme-main").trim() || "#011627";
  const fg = styles.getPropertyValue("--color-accent-variable").trim() || "#43d9ad";
  const hex = bg.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return { bg, fg, fade: `rgba(${r}, ${g}, ${b}, 0.12)` };
}

function onKeydown(event) {
  if (event.timeStamp <= mountedAt) return;
  if (event.key === "Tab") return; // never trap keyboard focus
  // Leave browser shortcuts (cmd/ctrl+R, etc.) working; just exit.
  if (!event.metaKey && !event.ctrlKey && !event.altKey) event.preventDefault();
  emit("exit");
}

onMounted(() => {
  const canvas = canvasEl.value;
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const { width, height } = canvas.getBoundingClientRect();
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  const { bg, fg, fade } = themeColors();
  const cols = Math.ceil(width / FONT_SIZE);
  const rows = Math.ceil(height / FONT_SIZE);
  const drops = Array.from({ length: cols }, () => Math.floor(Math.random() * -rows));

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);
  ctx.font = `${FONT_SIZE}px "Fira Code", monospace`;

  const step = () => {
    ctx.fillStyle = fade;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = fg;
    drops.forEach((y, x) => {
      if (y >= 0) ctx.fillText(glyph(), x * FONT_SIZE, y * FONT_SIZE);
      drops[x] = y * FONT_SIZE > height && Math.random() > 0.95 ? 0 : y + 1;
    });
  };

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    // One settled still frame instead of continuous animation.
    for (let i = 0; i < rows * 2; i++) step();
  } else {
    const loop = (t) => {
      if (t - lastFrame >= FRAME_MS) {
        lastFrame = t;
        step();
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
  }

  mountedAt = performance.now();
  window.addEventListener("keydown", onKeydown);
});

onUnmounted(() => {
  cancelAnimationFrame(rafId);
  window.removeEventListener("keydown", onKeydown);
});
</script>

<style scoped>
.matrix {
  background-color: var(--color-theme-main);
  cursor: pointer;
}

.matrix-hint {
  background-color: var(--color-theme-main);
  padding: 0 0.25rem;
}
</style>
