import { ref } from "vue";
import { v4 as uuidv4 } from "uuid";

export function useNavlinks() {
  const links = ref([
    {
      id: uuidv4(),
      to: "/me",
      name: "abhiram-krishna",
    },
    {
      id: uuidv4(),
      to: "/",
      name: "_hello",
    },
    {
      id: uuidv4(),
      to: "/about",
      name: "_about-me",
    },

    {
      id: uuidv4(),
      to: "/projects",
      name: " _projects",
    },
  ]);

  return { links };
}
