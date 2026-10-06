import { ref, onMounted } from "vue";

const IDLE_TIMEOUT_MS = 1500;
const FALLBACK_DELAY_MS = 200;

export function useWhenIdle() {
  const isIdle = ref(false);

  onMounted(() => {
    const markIdle = () => { isIdle.value = true; };
    if (typeof requestIdleCallback === "function") {
      requestIdleCallback(markIdle, { timeout: IDLE_TIMEOUT_MS });
    } else {
      setTimeout(markIdle, FALLBACK_DELAY_MS);
    }
  });

  return isIdle;
}
