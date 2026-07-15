import { ref } from "vue";

export function useNavlinks() {
  const links = ref([
    {
      id: "home",
      to: "/",
      name: "Home",
    },
    {
      id: "blogs",
      to: "/blogs",
      name: "Blogs",
      hidden: true,
    },
    {
      id: "projects",
      to: "/projects",
      name: "Projects",
      hidden: true,
    },
    {
      id: "contact",
      to: "/contact",
      name: "Contact Me",
      hidden: true,
    },
  ]);

  return { links };
}
