import { ref, computed, watchEffect } from "vue";
import { useTheme } from "@/composables/useTheme.js";

const KEYFRAMES = [
  { hour: 0, phase: "night", bg: "#011627", base: "#0c1f33", hover: "#43d9ad", fresnel: "#bfe9ff" },
  { hour: 4.5, phase: "night", bg: "#011627", base: "#0c1f33", hover: "#43d9ad", fresnel: "#bfe9ff" },
  { hour: 6.5, phase: "dawn", bg: "#1a1430", base: "#2a1f3d", hover: "#ff9e7a", fresnel: "#ffd1b8" },
  { hour: 9, phase: "day", bg: "#04223a", base: "#123a55", hover: "#5ee6ff", fresnel: "#d8f4ff" },
  { hour: 16, phase: "day", bg: "#04223a", base: "#123a55", hover: "#5ee6ff", fresnel: "#d8f4ff" },
  { hour: 18.5, phase: "dusk", bg: "#170f2a", base: "#2b1b3f", hover: "#c58cff", fresnel: "#f0c8ff" },
  { hour: 21, phase: "night", bg: "#011627", base: "#0c1f33", hover: "#43d9ad", fresnel: "#bfe9ff" },
  { hour: 24, phase: "night", bg: "#011627", base: "#0c1f33", hover: "#43d9ad", fresnel: "#bfe9ff" },
];
const GREETINGS = { night: "good evening", dawn: "good morning", day: "good afternoon", dusk: "good evening" };
const UPDATE_MS = 60 * 1000;

function hourOverride() {
  try {
    const value = new URLSearchParams(window.location.search).get("hour");
    const hour = value === null ? NaN : Number(value);
    return Number.isFinite(hour) ? ((hour % 24) + 24) % 24 : null;
  } catch {
    return null;
  }
}

function currentHour() {
  const forced = hourOverride();
  if (forced !== null) return forced;
  const now = new Date();
  return now.getHours() + now.getMinutes() / 60;
}

const channels = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

function mix(from, to, t) {
  const a = channels(from);
  const b = channels(to);
  return `#${a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, "0")).join("")}`;
}

function paletteAt(hour) {
  const i = KEYFRAMES.findIndex((k) => k.hour > hour);
  const to = KEYFRAMES[i];
  const from = KEYFRAMES[i - 1];
  const t = (hour - from.hour) / (to.hour - from.hour);
  const s = t * t * (3 - 2 * t);
  return {
    phase: s < 0.5 ? from.phase : to.phase,
    bg: mix(from.bg, to.bg, s),
    base: mix(from.base, to.base, s),
    hover: mix(from.hover, to.hover, s),
    fresnel: mix(from.fresnel, to.fresnel, s),
  };
}

const hour = ref(currentHour());
const palette = computed(() => paletteAt(hour.value));
const greeting = computed(() => {
  const h = hour.value;
  if (h >= 4.5 && h < 12) return "good morning";
  if (h >= 12 && h < 17) return "good afternoon";
  return GREETINGS[palette.value.phase] ?? "good evening";
});

if (typeof window !== "undefined") {
  setInterval(() => { hour.value = currentHour(); }, UPDATE_MS);
  const { theme } = useTheme();
  watchEffect(() => {
    const root = document.documentElement;
    if (theme.value === "dark") root.style.setProperty("--color-theme-main", palette.value.bg);
    else root.style.removeProperty("--color-theme-main");
  });
}

export function useDayPhase() {
  return { hour, palette, greeting };
}
