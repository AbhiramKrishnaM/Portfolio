import { ref, nextTick, onMounted, onUnmounted } from "vue";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNavLinks } from "@/composables/useNavLinks.js";

gsap.registerPlugin(ScrollTrigger);

const DESKTOP_QUERY = "(min-width: 1024px)";

function bezierPoint(t, p1, p2, dx, dy) {
  const mt = 1 - t;
  const a = 3 * mt * mt * t;
  const b = 3 * mt * t * t;
  const c = t * t * t;
  return {
    x: a * p1.x + b * p2.x + c * dx,
    y: a * p1.y + b * p2.y + c * dy,
  };
}

export function useTerminalScroll({ heroRef, panelRef, dockRef }) {
  const terminalScene = ref("intro");
  const { activeSection } = useNavLinks();
  let matchMedia = null;

  function setScene(scene) {
    terminalScene.value = scene;
    activeSection.value = scene === "projects" ? "projects" : null;
  }

  function setupMotionPath() {
    matchMedia?.revert();
    matchMedia = gsap.matchMedia();

    matchMedia.add(DESKTOP_QUERY, () => {
      if (!heroRef.value || !panelRef.value || !dockRef.value) return;

      const progress = { value: 0 };
      let path;

      const applyPoint = () => {
        const point = bezierPoint(progress.value, path.p1, path.p2, path.dx, path.dy);
        gsap.set(panelRef.value, { x: point.x, y: point.y });
      };

      const measurePath = () => {
        gsap.set(panelRef.value, { x: 0, y: 0 });
        const startRect = panelRef.value.getBoundingClientRect();
        const dockRect = dockRef.value.getBoundingClientRect();
        const dx = (dockRect.left + dockRect.width / 2) - (startRect.left + startRect.width / 2);
        const dy = (dockRect.top + dockRect.height / 2) - (startRect.top + startRect.height / 2);
        path = { dx, dy, p1: { x: 0, y: dy * 0.6 }, p2: { x: dx * 0.4, y: dy * 0.95 } };
        applyPoint();
      };

      measurePath();

      const tween = gsap.to(progress, {
        value: 1,
        ease: "none",
        onUpdate: applyPoint,
        scrollTrigger: {
          trigger: heroRef.value,
          start: "top top",
          end: "bottom top",
          scrub: 1,
          onRefresh: measurePath,
        },
      });

      const sceneTrigger = ScrollTrigger.create({
        trigger: heroRef.value,
        start: "bottom 15%",
        onEnter: () => setScene("projects"),
        onLeaveBack: () => setScene("intro"),
      });

      return () => {
        sceneTrigger.kill();
        setScene("intro");
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });
    ScrollTrigger.refresh();
  }

  onMounted(() => {
    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    fontsReady.then(() => nextTick(setupMotionPath));
  });

  onUnmounted(() => matchMedia?.revert());

  return { terminalScene };
}
