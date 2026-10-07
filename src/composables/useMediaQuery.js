import { ref, onMounted, onUnmounted } from "vue";

export function useMediaQuery(query) {
  const matches = ref(false);
  let mql = null;
  const update = () => { matches.value = mql.matches; };

  onMounted(() => {
    mql = window.matchMedia(query);
    update();
    mql.addEventListener("change", update);
  });

  onUnmounted(() => mql?.removeEventListener("change", update));

  return matches;
}
