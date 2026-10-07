import { onMounted, onUnmounted } from "vue";
import { useNavLinks } from "@/composables/useNavLinks.js";
import { SECTION_LINE } from "@/composables/storyline.js";

export function useSectionSpy(ids) {
  const { activeSection } = useNavLinks();
  let frame = null;

  function update() {
    frame = null;
    const line = window.innerHeight * SECTION_LINE;
    let current = null;
    for (const id of ids) {
      const el = document.getElementById(id);
      if (!el || el.offsetParent === null) continue;
      if (el.getBoundingClientRect().top <= line) current = id;
    }
    activeSection.value = current;
  }

  function schedule() {
    if (frame === null) frame = requestAnimationFrame(update);
  }

  onMounted(() => {
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    update();
  });

  onUnmounted(() => {
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
    cancelAnimationFrame(frame);
    activeSection.value = null;
  });
}
