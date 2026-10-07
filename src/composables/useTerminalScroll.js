import { ref, nextTick, onMounted, onUnmounted } from "vue";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { story, measureStory, SECTION_LINE } from "@/composables/storyline.js";

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

export function useTerminalScroll({ heroRef, panelRef, dockRef, pinRef, stackRef }) {
  const terminalScene = ref("intro");
  let matchMedia = null;

  function setScene(scene) {
    terminalScene.value = scene;
  }

  function setupMotionPath() {
    matchMedia?.revert();
    matchMedia = gsap.matchMedia();

    matchMedia.add(DESKTOP_QUERY, () => {
      if (!heroRef.value || !panelRef.value || !dockRef.value || !pinRef.value || !stackRef.value) return;

      const progress = { value: 0 };
      let pinOffset = 0;
      let path;

      const applyPoint = () => {
        const point = bezierPoint(progress.value, path.p1, path.p2, path.dx, path.dy);
        gsap.set(panelRef.value, { x: point.x, y: point.y + pinOffset });
        story.flight.progress = progress.value;
        story.flight.el = panelRef.value;
      };

      const measurePath = () => {
        gsap.set(panelRef.value, { x: 0, y: 0 });
        const startRect = panelRef.value.getBoundingClientRect();
        const dockRect = dockRef.value.getBoundingClientRect();
        const stickyRect = dockRef.value.parentElement.getBoundingClientRect();
        const pinRect = pinRef.value.getBoundingClientRect();
        const dockTop = pinRect.top + (dockRect.top - stickyRect.top);
        const dx = (dockRect.left + dockRect.width / 2) - (startRect.left + startRect.width / 2);
        const dy = (dockTop + dockRect.height / 2) - (startRect.top + startRect.height / 2);
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

      const pinTrigger = ScrollTrigger.create({
        trigger: pinRef.value,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          pinOffset = self.progress * (self.end - self.start);
          applyPoint();
        },
        onRefresh: (self) => {
          pinOffset = self.progress * (self.end - self.start);
        },
      });

      const projectsTrigger = ScrollTrigger.create({
        trigger: heroRef.value,
        start: "bottom 15%",
        onEnter: () => setScene("projects"),
        onLeaveBack: () => setScene("intro"),
      });

      const stackTrigger = ScrollTrigger.create({
        trigger: stackRef.value,
        start: `top ${SECTION_LINE * 100}%`,
        onEnter: () => setScene("stack"),
        onLeaveBack: () => setScene("projects"),
      });

      return () => {
        projectsTrigger.kill();
        stackTrigger.kill();
        pinTrigger.kill();
        setScene("intro");
        story.flight.progress = 0;
        story.flight.el = null;
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });
    ScrollTrigger.refresh();
  }

  onMounted(() => {
    ScrollTrigger.addEventListener("refresh", measureStory);
    window.addEventListener("load", measureStory);
    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    fontsReady.then(() => nextTick(() => {
      setupMotionPath();
      measureStory();
    }));
  });

  onUnmounted(() => {
    ScrollTrigger.removeEventListener("refresh", measureStory);
    window.removeEventListener("load", measureStory);
    matchMedia?.revert();
    story.markers = null;
  });

  return { terminalScene };
}
