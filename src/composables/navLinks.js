import { ref } from "vue";
import { v4 as uuidv4 } from "uuid";

export function useNavlinks() {
  const links = ref([
    {
      id: uuidv4(),
      to: "/",
      name: "Home",
    },
    {
      id: uuidv4(),
      to: "/blogs",
      name: "Blogs",
      hidden: true,
    },
    {
      id: uuidv4(),
      to: "/projects",
      name: "Projects",
      hidden: true,
    },
    {
      id: uuidv4(),
      to: "/contact",
      name: "Contact Me",
      hidden: true,
    },
  ]);

  return { links };
}
