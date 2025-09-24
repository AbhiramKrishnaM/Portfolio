import { ref, onMounted, onUnmounted } from "vue";

export function useDynamicHeight(fixedElementsHeight = 48) {
  const availableHeight = ref(0);
  const viewportHeight = ref(0);

  const calculateHeight = () => {
    // Get viewport height
    viewportHeight.value = window.innerHeight;

    // Calculate available height (viewport height minus fixed elements)
    // The fixed elements are: sub-navbar (48px)
    availableHeight.value = Math.max(0, viewportHeight.value - fixedElementsHeight);
  };

  const updateHeight = () => {
    calculateHeight();
  };

  onMounted(() => {
    // Calculate initial height
    calculateHeight();

    // Add resize listener
    window.addEventListener("resize", updateHeight);
  });

  onUnmounted(() => {
    // Clean up resize listener
    window.removeEventListener("resize", updateHeight);
  });

  return {
    availableHeight,
    viewportHeight,
    updateHeight
  };
}
