import { ref, computed, watch } from "vue";
import { PROJECTS } from "@/data/projects.js";
import { unlock } from "@/composables/achievements.js";

export function useProjectSelection(terminalScene) {
  const selectedIdx = ref(0);
  const selectedProject = computed(() => PROJECTS[selectedIdx.value]);

  function selectProject(slug) {
    const idx = PROJECTS.findIndex((p) => p.slug === slug);
    if (idx !== -1) selectedIdx.value = idx;
  }

  function stepProject(step) {
    selectedIdx.value = (selectedIdx.value + step + PROJECTS.length) % PROJECTS.length;
  }

  watch(terminalScene, (scene) => {
    if (scene === "projects") {
      selectedIdx.value = 0;
      unlock("portfolio");
    }
  });

  return { selectedIdx, selectedProject, selectProject, stepProject, projectCount: PROJECTS.length };
}
