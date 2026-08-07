import { ref } from "vue";

export function useNavlinks() {
  const links = ref([
    {
      id: "home",
      to: "/",
      name: "Home",
    },
  ]);

  return { links };
}
