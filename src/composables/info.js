import { ref } from "vue";

export function useInfo() {
  const landing = ref({
    title: "",
    subtitle: "",
    reference: [],
  });

  return {
    landing,
  };
}
