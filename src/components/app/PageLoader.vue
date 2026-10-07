<template>
  <div v-if="loaderActive" ref="rootRef" class="page-loader" :class="{ 'page-loader--wiping': wiping }" role="status"
    aria-label="Loading Abhiram Krishna M's portfolio" data-cursor="skip intro" @click="skip">
    <div class="page-loader__rows" aria-hidden="true">
      <div v-for="row in rows" :key="row.id" class="page-loader__row">
        <template v-if="row.brand">
          <span v-for="gap in row.parts" :key="gap.id" :class="gap.word ? 'page-loader__word' : 'page-loader__gap'"
            :data-gap="gap.word ? null : gap.id">
            <span v-for="(char, i) in gap.chars" :key="i" class="page-loader__letter"
              :class="gap.word ? 'page-loader__letter--brand' : 'page-loader__letter--random'">{{ char }}</span>
          </span>
        </template>
        <template v-else>
          <span v-for="(char, i) in row.chars" :key="i"
            class="page-loader__letter page-loader__letter--random">{{ char }}</span>
        </template>
      </div>
    </div>
    <canvas ref="ditherRef" class="page-loader__dither" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import gsap from "gsap";
import { loaderActive, finishIntro } from "@/composables/introGate.js";
import { prefersReducedMotion } from "@/composables/storyline.js";

const ROW_LENGTH = 18;
const FIRST_NAME = "ABHIRAM";
const LAST_NAME = "KRISHNA";
const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#/<>{}";
const DITHER_CELL_PX = 6;
const DITHER_SECONDS = 0.55;
const BAYER_8 = [
  0, 32, 8, 40, 2, 34, 10, 42,
  48, 16, 56, 24, 50, 18, 58, 26,
  12, 44, 4, 36, 14, 46, 6, 38,
  60, 28, 52, 20, 62, 30, 54, 22,
  3, 35, 11, 43, 1, 33, 9, 41,
  51, 19, 59, 27, 49, 17, 57, 25,
  15, 47, 7, 39, 13, 45, 5, 37,
  63, 31, 55, 23, 61, 29, 53, 21,
];

const randomChars = (count) =>
  Array.from({ length: count }, () => CHARSET[Math.floor(Math.random() * CHARSET.length)]);

const brandFiller = ROW_LENGTH - FIRST_NAME.length - LAST_NAME.length;
const rows = [
  { id: "row-1", chars: randomChars(ROW_LENGTH) },
  { id: "row-2", chars: randomChars(ROW_LENGTH) },
  {
    id: "row-brand",
    brand: true,
    parts: [
      { id: "lead", chars: randomChars(Math.floor((brandFiller - 2) / 2)) },
      { id: "first", word: true, chars: [...FIRST_NAME] },
      { id: "mid", chars: randomChars(2) },
      { id: "last", word: true, chars: [...LAST_NAME] },
      { id: "trail", chars: randomChars(Math.ceil((brandFiller - 2) / 2)) },
    ],
  },
  { id: "row-4", chars: randomChars(ROW_LENGTH) },
  { id: "row-5", chars: randomChars(ROW_LENGTH) },
];

const rootRef = ref(null);
const ditherRef = ref(null);
const wiping = ref(false);
let timeline = null;
let ditherFrame = null;
let finished = false;

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  const full = value.length === 3 ? [...value].map((c) => c + c).join("") : value;
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function lockScroll(locked) {
  document.documentElement.style.overflow = locked ? "hidden" : "";
}

function done() {
  if (finished) return;
  finished = true;
  cancelAnimationFrame(ditherFrame);
  timeline?.kill();
  lockScroll(false);
  finishIntro();
}

function runDitherWipe() {
  const canvas = ditherRef.value;
  if (!canvas) return done();
  const cols = Math.ceil(window.innerWidth / DITHER_CELL_PX);
  const rowsCount = Math.ceil(window.innerHeight / DITHER_CELL_PX);
  canvas.width = cols;
  canvas.height = rowsCount;
  const ctx = canvas.getContext("2d");
  const image = ctx.createImageData(cols, rowsCount);
  const [r, g, b] = hexToRgb(cssVar("--color-theme-main") || "#011627");
  const cx = cols / 2;
  const cy = rowsCount / 2;
  const maxDist = Math.hypot(cx, cy);
  const thresholds = new Float32Array(cols * rowsCount);
  for (let y = 0; y < rowsCount; y++) {
    for (let x = 0; x < cols; x++) {
      const bayer = BAYER_8[(y % 8) * 8 + (x % 8)] / 64;
      const radial = Math.hypot(x - cx, y - cy) / maxDist;
      thresholds[y * cols + x] = bayer * 0.6 + radial * 0.4;
    }
  }

  const draw = (progress) => {
    const data = image.data;
    for (let i = 0; i < thresholds.length; i++) {
      const o = i * 4;
      data[o] = r;
      data[o + 1] = g;
      data[o + 2] = b;
      data[o + 3] = thresholds[i] >= progress ? 255 : 0;
    }
    ctx.putImageData(image, 0, 0);
  };

  draw(0);
  wiping.value = true;
  const start = performance.now();
  const step = (now) => {
    const t = Math.min(1, (now - start) / (DITHER_SECONDS * 1000));
    draw(t * t * (3 - 2 * t) * 1.02);
    if (t < 1) ditherFrame = requestAnimationFrame(step);
    else done();
  };
  ditherFrame = requestAnimationFrame(step);
}

function skip() {
  if (finished || wiping.value) return;
  timeline?.kill();
  gsap.to(rootRef.value.querySelectorAll(".page-loader__letter"), { autoAlpha: 0, duration: 0.15, onComplete: runDitherWipe });
}

function onKey(e) {
  if (e.key === "Escape" || e.key === "Enter" || e.key === " ") skip();
}

function playReduced(root) {
  gsap.set(root.querySelectorAll(".page-loader__letter--random"), { autoAlpha: 0 });
  timeline = gsap.timeline({ onComplete: done })
    .to(root, { autoAlpha: 0, duration: 0.25, delay: 0.5 });
}

function playFull(root) {
  const random = root.querySelectorAll(".page-loader__letter--random");
  const brand = root.querySelectorAll(".page-loader__letter--brand");
  const sideGaps = root.querySelectorAll('[data-gap="lead"], [data-gap="trail"]');
  const midGap = root.querySelector('[data-gap="mid"]');
  const midWidth = parseFloat(getComputedStyle(midGap).fontSize) * 0.6;
  const accent = cssVar("--color-accent-variable");

  gsap.set([random, brand], { autoAlpha: 0, xPercent: -120 });

  timeline = gsap.timeline()
    .to(random, { autoAlpha: 1, xPercent: 0, duration: 0.45, ease: "power2.out", stagger: { amount: 0.4, from: "random" } })
    .to(brand, { autoAlpha: 1, xPercent: 0, duration: 0.45, ease: "power2.out", stagger: 0.03 }, 0.12)
    .to(random, { opacity: 0.16, duration: 0.35, ease: "sine.inOut", stagger: { amount: 0.2, from: "random" } }, "+=0.05")
    .to(brand, { color: accent, duration: 0.35, ease: "sine.inOut" }, "<")
    .addLabel("converge", "+=0.05")
    .to(random, { autoAlpha: 0, xPercent: 120, duration: 0.4, ease: "power2.inOut", stagger: { amount: 0.15, from: "random" } }, "converge")
    .fromTo(sideGaps, { width: (i, el) => el.offsetWidth }, { width: 0, duration: 0.45, ease: "power2.inOut" }, "converge+=0.1")
    .fromTo(midGap, { width: () => midGap.offsetWidth }, { width: midWidth, duration: 0.45, ease: "power2.inOut" }, "converge+=0.1")
    .addLabel("exit", "+=0.2")
    .to(brand, { autoAlpha: 0, yPercent: -40, duration: 0.3, ease: "power2.in", stagger: 0.012 }, "exit")
    .add(runDitherWipe, "exit+=0.25");
}

onMounted(() => {
  if (!loaderActive.value) return;
  lockScroll(true);
  window.addEventListener("keydown", onKey);
  nextTick(() => {
    const root = rootRef.value;
    if (!root) return done();
    if (prefersReducedMotion()) playReduced(root);
    else playFull(root);
  });
});

onUnmounted(() => {
  window.removeEventListener("keydown", onKey);
  cancelAnimationFrame(ditherFrame);
  timeline?.kill();
  lockScroll(false);
});
</script>

<style scoped>
.page-loader {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-theme-main);
}

.page-loader--wiping {
  background-color: transparent;
}

.page-loader__rows {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: clamp(1.6rem, 4.6vw, 5rem);
  line-height: 1.15;
  color: var(--color-white-gradient-01);
  user-select: none;
}

.page-loader__row {
  display: flex;
  justify-content: center;
  white-space: nowrap;
}

.page-loader__gap,
.page-loader__word {
  display: inline-flex;
  overflow: hidden;
}

.page-loader__letter {
  display: inline-block;
  width: 0.6em;
  text-align: center;
}

.page-loader__dither {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  image-rendering: pixelated;
  pointer-events: none;
}
</style>
