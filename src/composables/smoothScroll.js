import { onMounted, onUnmounted } from "vue";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { story, prefersReducedMotion } from "@/composables/storyline.js";
import { introDone } from "@/composables/introGate.js";

const SETTLE_MS = 140;
const NEAR_RANGE = 0.12;
const AHEAD_RANGE = 1.05;
const SNAP_DURATION = 0.75;
const MIN_SNAP_PX = 3;

let lenis = null;

export function scrollToY(y, { immediate = false } = {}) {
  if (lenis) lenis.scrollTo(y, { duration: immediate ? 0 : 1.1, immediate });
  else window.scrollTo({ top: y, behavior: immediate ? "auto" : "smooth" });
}

export function scrollToElement(el, block = "start") {
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const offset = block === "center" ? (window.innerHeight - rect.height) / 2 : 0;
  scrollToY(rect.top + window.scrollY - offset);
}

function snapPoints() {
  const m = story.markers;
  if (!m) return [];
  const points = [
    0,
    m.projectsTop,
    m.stackStart + MIN_SNAP_PX * 2,
    ...(story.extraSnaps?.() ?? []),
    m.aboutTop,
    m.maxScroll,
  ];
  return points.filter((p) => Number.isFinite(p) && p >= 0 && p <= m.maxScroll);
}

export function useSmoothScroll() {
  let settleTimer = null;
  let snapping = false;
  let tick = null;
  const onWheel = () => { snapping = false; };

  let anchor = 0;

  function snap() {
    if (!lenis || snapping) return;
    const current = window.scrollY;
    const vh = window.innerHeight;
    const points = snapPoints();
    const near = points.find((p) => Math.abs(p - current) <= vh * NEAR_RANGE);
    const dir = Math.sign(current - anchor);
    const ahead = dir === 0 ? [] : points.filter((p) => (p - current) * dir > 0 && Math.abs(p - current) <= vh * AHEAD_RANGE);
    ahead.sort((a, b) => Math.abs(a - current) - Math.abs(b - current));
    const best = near ?? ahead[0] ?? null;
    if (best === null) {
      anchor = current;
      return;
    }
    anchor = best;
    if (Math.abs(best - current) < MIN_SNAP_PX) return;
    snapping = true;
    lenis.scrollTo(best, {
      duration: SNAP_DURATION,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      onComplete: () => { snapping = false; },
    });
  }

  function onScroll() {
    ScrollTrigger.update();
    clearTimeout(settleTimer);
    if (!snapping) settleTimer = setTimeout(snap, SETTLE_MS);
  }

  onMounted(() => {
    if (prefersReducedMotion()) return;
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.9, smoothWheel: true });
    lenis.on("scroll", onScroll);
    tick = (time) => lenis?.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
    introDone.then(() => lenis?.start());
    window.addEventListener("wheel", onWheel, { passive: true });
  });

  onUnmounted(() => {
    clearTimeout(settleTimer);
    window.removeEventListener("wheel", onWheel);
    if (tick) gsap.ticker.remove(tick);
    lenis?.destroy();
    lenis = null;
  });
}
