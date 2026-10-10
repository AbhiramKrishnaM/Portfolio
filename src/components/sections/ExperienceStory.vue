<template>
  <section id="experience" ref="sectionRef" class="journey relative z-10" :style="{ height: sectionHeight }"
    aria-labelledby="experience-heading">
    <h2 id="experience-heading" class="sr-only">Experience</h2>
    <ol class="sr-only">
      <li v-for="job in EXPERIENCE" :key="job.company">
        {{ job.company }}, {{ job.role }}, {{ job.dates }}. {{ job.points.join(". ") }}
      </li>
    </ol>

    <div class="sticky top-0 h-screen">
      <div ref="stageRef" class="journey-stage" aria-hidden="true">
        <canvas ref="canvasRef" class="journey-canvas" />
        <svg class="journey-leaders">
          <line v-for="(label, i) in labels" :key="label.key" :ref="(el) => { lineEls[i] = el; }" class="journey-leader" />
          <rect v-for="(label, i) in labels" :key="`m-${label.key}`" :ref="(el) => { markerEls[i] = el; }"
            class="journey-marker" width="7" height="7" />
        </svg>
        <span v-for="(text, i) in tagTexts" :key="`t-${i}`" :ref="(el) => { tagEls[i] = el; }" class="holo-tag">{{ text }}</span>
        <div v-for="(label, i) in labels" :key="label.key" :ref="(el) => { labelEls[i] = el; }" class="holo-label">
          <span class="holo-label__title">{{ label.title }}</span>
          <span class="holo-label__sub">{{ label.sub }}</span>
        </div>
      </div>

      <div ref="textRef" class="journey-text" :class="textOnLeft ? 'journey-text--left' : 'journey-text--right'">
        <p class="text-sm text-accent-variable">$ experience</p>
        <article class="mt-6" aria-hidden="true">
          <div class="flex items-end gap-4">
            <span class="journey-number">{{ chapter.number }}</span>
            <span class="text-xs uppercase tracking-widest text-accent-url pb-2">{{ chapter.eyebrow }}</span>
          </div>
          <h3 class="text-3xl xl:text-4xl text-white-gradient-01 mt-4">{{ chapter.title }}</h3>
          <ul class="mt-6 flex flex-col gap-2 text-sm text-gray-gradient-01">
            <li v-for="(point, i) in chapter.points" :key="i" class="flex gap-2">
              <span class="text-accent-variable shrink-0">&gt;</span>
              <span>{{ point }}</span>
            </li>
          </ul>
          <ul v-if="chapter.tags.length" class="mt-6 flex flex-wrap gap-2">
            <li v-for="tag in chapter.tags" :key="tag" class="journey-tag">{{ tag }}</li>
          </ul>
        </article>

        <nav class="mt-10 flex items-center" aria-label="Experience chapters">
          <button v-for="(item, i) in JOURNEY" :key="item.id" type="button" class="journey-dot"
            :class="{ 'journey-dot--active': i === chapterIndex, 'journey-dot--done': i < chapterIndex }"
            :aria-label="`Go to ${item.title}`" :data-cursor="item.title" @click="goToChapter(i)" />
        </nav>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EXPERIENCE } from "@/data/experience.js";
import { JOURNEY } from "@/data/journey.js";
import { useTheme } from "@/composables/useTheme.js";
import { story } from "@/composables/storyline.js";
import { scrollToY } from "@/composables/smoothScroll.js";
import { buildTimeline } from "@/components/story/hologram/journeyTimeline.js";
import { createJourneyHologram, sideOf } from "@/components/story/hologram/journeyHologram.js";

const PROGRESS_EASE = 0.12;
const LEADER_DX = 56;
const LEADER_DY = 84;
const LABEL_RULE_OFFSET = 26;

const timeline = buildTimeline(JOURNEY);
const sectionHeight = `${(timeline.total + 1) * 100}vh`;

const labels = JOURNEY.flatMap((chapter, c) =>
  chapter.beats.map((beat, b) => ({
    key: `${chapter.id}-${b}`,
    ...beat,
    range: timeline.ranges[c].beats[b],
    isLast: c === JOURNEY.length - 1 && b === chapter.beats.length - 1,
  })),
);

const sectionRef = ref(null);
const stageRef = ref(null);
const canvasRef = ref(null);
const labelEls = [];
const lineEls = [];
const markerEls = [];
const tagEls = [];
const tagTexts = ref([]);
const chapterIndex = ref(0);
const chapter = computed(() => JOURNEY[chapterIndex.value]);
const textOnLeft = computed(() => sideOf(chapterIndex.value) > 0);
const textRef = ref(null);
const { theme } = useTheme();

let holo = null;
let frameId = null;
let resizeObserver = null;
let smoothP = 0;
let stageSize = { width: 1, height: 1 };

function cssVar(name, fallback) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

function applyTheme() {
  holo?.setTheme({
    board: cssVar("--color-accent-color", "#607b96"),
    accent: cssVar("--color-accent-variable", "#43d9ad"),
    hot: cssVar("--color-white-gradient-01", "#e5e9f0"),
    soft: cssVar("--color-accent-variable", "#43d9ad"),
    additive: theme.value !== "light",
  });
}

function scrollProgress() {
  const rect = sectionRef.value.getBoundingClientRect();
  const range = rect.height - window.innerHeight;
  const vh = window.innerHeight;
  return {
    p: range > 0 ? Math.min(1, Math.max(0, -rect.top / range)) : 0,
    onScreen: rect.top < vh && rect.bottom > 0,
    nearScreen: rect.top < vh * 3 && rect.bottom > -vh,
  };
}

function placeLabels() {
  labels.forEach((label, i) => {
    const el = labelEls[i];
    const line = lineEls[i];
    const marker = markerEls[i];
    if (!el || !line || !marker) return;
    const alpha = timeline.beatAlpha(smoothP, label.range, label.isLast);
    const point = alpha > 0.01 ? holo.anchor(label.target) : null;
    if (!point || point.vis < 0.05) {
      el.style.opacity = "0";
      line.style.opacity = "0";
      marker.style.opacity = "0";
      return;
    }
    const dir = point.x < stageSize.width * 0.5 ? -1 : 1;
    const ruleX = point.x + dir * LEADER_DX;
    const ruleY = point.y - LEADER_DY;
    const shift = dir < 0 ? "-100%" : "0";
    el.style.opacity = String(alpha);
    el.style.transform = `translate(${ruleX}px, ${ruleY - LABEL_RULE_OFFSET}px) translateX(${shift})`;
    el.classList.toggle("holo-label--left", dir < 0);
    line.setAttribute("x1", point.x);
    line.setAttribute("y1", point.y);
    line.setAttribute("x2", ruleX);
    line.setAttribute("y2", ruleY);
    line.style.opacity = String(alpha);
    marker.setAttribute("transform", `translate(${point.x} ${point.y}) rotate(45) translate(-3.5 -3.5)`);
    marker.style.opacity = String(alpha);
  });
}

function placeTags(time) {
  tagEls.forEach((el, i) => {
    if (!el) return;
    const point = holo.tagPosition(i, time);
    if (!point) {
      el.style.opacity = "0";
      return;
    }
    el.style.opacity = String(point.vis);
    el.style.transform = `translate(${point.x}px, ${point.y}px) translate(-50%, -100%)`;
  });
}

function publishHandoff() {
  const point = holo?.anchor("me");
  if (!point) return;
  const rect = stageRef.value.getBoundingClientRect();
  story.handoff = { x: rect.left + point.x, y: rect.top + point.y };
}

function tick(now) {
  frameId = requestAnimationFrame(tick);
  const { p, onScreen, nearScreen } = scrollProgress();
  smoothP += (p - smoothP) * PROGRESS_EASE;
  if (Math.abs(p - smoothP) < 1e-4) smoothP = p;
  const index = timeline.chapterIndexAt(smoothP);
  if (index !== chapterIndex.value) chapterIndex.value = index;
  if (nearScreen) publishHandoff();
  if (!onScreen || !holo) return;
  holo.update(smoothP, now / 1000);
  const textAlpha = holo.textAlphaAt(smoothP);
  textRef.value.style.opacity = String(textAlpha);
  textRef.value.style.transform = `translateY(${(1 - textAlpha) * 14}px)`;
  holo.render();
  placeLabels();
  placeTags(now / 1000);
}

function onResize() {
  const rect = stageRef.value.getBoundingClientRect();
  stageSize = { width: rect.width, height: rect.height };
  holo?.resize(rect.width, rect.height);
}

function chapterSnaps() {
  const section = sectionRef.value;
  if (!section) return [];
  const top = section.getBoundingClientRect().top + window.scrollY;
  const range = section.offsetHeight - window.innerHeight;
  return timeline.ranges.map((r) => top + range * (r.start + (r.end - r.start) * 0.35));
}

function goToChapter(i) {
  const section = sectionRef.value;
  const top = section.getBoundingClientRect().top + window.scrollY;
  const range = section.offsetHeight - window.innerHeight;
  const target = top + range * (timeline.ranges[i].start + 0.01);
  scrollToY(target);
}

watch(theme, () => requestAnimationFrame(applyTheme));

onMounted(() => {
  holo = createJourneyHologram(canvasRef.value, timeline);
  tagTexts.value = holo.tagTexts;
  onResize();
  applyTheme();
  smoothP = scrollProgress().p;
  resizeObserver = new ResizeObserver(onResize);
  resizeObserver.observe(stageRef.value);
  story.extraSnaps = chapterSnaps;
  frameId = requestAnimationFrame(tick);
  nextTick(() => ScrollTrigger.refresh());
});

onUnmounted(() => {
  cancelAnimationFrame(frameId);
  story.handoff = null;
  story.extraSnaps = null;
  resizeObserver?.disconnect();
  holo?.dispose();
  nextTick(() => ScrollTrigger.refresh());
});
</script>

<style scoped>
.journey-stage {
  position: absolute;
  inset: 0 0 0 6.5rem;
}

.journey-text {
  position: absolute;
  top: 0;
  bottom: 0;
  width: min(30rem, 32%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  will-change: opacity, transform;
}

.journey-text--left {
  left: max(8rem, 11%);
}

.journey-text--right {
  right: max(4rem, 9%);
}

.journey-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 0 3px rgba(67, 217, 173, 0.55));
}

:root[data-theme="light"] .journey-canvas {
  filter: none;
}

.journey-leaders {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
}

.journey-marker {
  fill: var(--color-theme-main);
  stroke: var(--color-white-gradient-01);
  stroke-width: 1.2;
  opacity: 0;
}

.holo-tag {
  position: absolute;
  left: 0;
  top: 0;
  padding: 0 0.2rem;
  font-size: 0.62rem;
  letter-spacing: 0.08em;
  color: var(--color-white-gradient-01);
  opacity: 0;
  pointer-events: none;
  white-space: nowrap;
  will-change: transform, opacity;
}

.journey-leader {
  stroke: var(--color-accent-variable);
  stroke-width: 1;
  opacity: 0;
}

.holo-label {
  position: absolute;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  opacity: 0;
  pointer-events: none;
  white-space: nowrap;
  will-change: transform, opacity;
}

.holo-label--left {
  align-items: flex-end;
}

.holo-label__title,
.holo-label__sub {
  background-color: color-mix(in srgb, var(--color-theme-main) 72%, transparent);
}

.holo-label__title {
  padding: 0.1rem 0.3rem 0.2rem;
  border-bottom: 1px solid var(--color-accent-variable);
  font-size: 0.95rem;
  letter-spacing: 0.08em;
  color: var(--color-white-gradient-01);
}

.holo-label__sub {
  padding: 0.25rem 0.3rem 0.1rem;
  font-size: 0.68rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-accent-variable);
}

.journey-number {
  font-size: 4.5rem;
  line-height: 1;
  font-weight: 600;
  color: var(--color-accent-url);
}

.journey-tag {
  padding: 0.2rem 0.6rem;
  border: 1px solid var(--color-border-white);
  border-radius: 8px;
  font-size: 0.75rem;
  color: var(--color-gray-gradient-01);
}

.journey-dot {
  display: grid;
  place-items: center;
  min-width: 24px;
  height: 24px;
  padding: 0;
  background: transparent;
  border: none;
}

.journey-dot::before {
  content: "";
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 9999px;
  border: 1px solid var(--color-accent-variable);
  transition: width 0.3s ease, background-color 0.3s ease;
}

.journey-dot--done::before {
  background-color: var(--color-accent-variable);
  opacity: 0.45;
}

.journey-dot--active::before {
  width: 1.6rem;
  background-color: var(--color-accent-variable);
}
</style>
