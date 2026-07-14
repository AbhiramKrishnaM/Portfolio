import { ref } from "vue";
import { v4 as uuidv4 } from "uuid";

export function useNavlinks() {
  // Placeholder route set — swap these for the real portfolio routes later.
  const links = ref([
    {
      id: uuidv4(),
      to: "/menus",
      name: "Menus",
    },
    {
      id: uuidv4(),
      to: "/wine-list",
      name: "Wine List",
    },
    {
      id: uuidv4(),
      to: "/chefs-story",
      name: "Chef's Story",
    },
    {
      id: uuidv4(),
      to: "/reservations",
      name: "Reservations",
    },
    {
      id: uuidv4(),
      to: "/gallery",
      name: "Gallery",
    },
  ]);

  return { links };
}
