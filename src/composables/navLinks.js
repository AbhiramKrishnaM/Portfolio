import { ref } from "vue";

const activeSection = ref(null);

export function scrollToSection(id) {
  const candidates = [
    document.getElementById(id),
    ...document.querySelectorAll(`[data-section-fallback="${id}"]`),
  ];
  const target = candidates.find((el) => el && el.offsetParent !== null);
  if (!target) return false;
  target.scrollIntoView({ behavior: "smooth", block: target.id === id ? "start" : "center" });
  return true;
}

export function useNavlinks() {
  const links = ref([
    {
      id: "home",
      to: "/",
      name: "Home",
    },
    {
      id: "projects",
      to: "/",
      section: "projects",
      name: "Projects",
    },
  ]);

  return { links, activeSection };
}
