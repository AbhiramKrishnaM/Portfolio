import { ref } from "vue";
import { v4 as uuidv4 } from "uuid";

export function useNavlinks() {
  const isProd = import.meta.env.PROD;

  const links = ref([
    {
      id: uuidv4(),
      to: "/me",
      name: "abhiram-krishna",
      hidden: isProd,
    },
    {
      id: uuidv4(),
      to: "/",
      name: "_hello",
    },
    {
      id: uuidv4(),
      to: "/about",
      name: "_about_me",
      hidden: isProd,
    },

    {
      id: uuidv4(),
      to: "/projects",
      name: " _projects",
      hidden: isProd,
    },
  ]);

  return { links };
}
