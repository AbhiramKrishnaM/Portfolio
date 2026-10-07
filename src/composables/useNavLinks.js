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

export function useNavLinks() {
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
      desktopOnly: true,
    },
    {
      id: "stack",
      to: "/",
      section: "stack",
      name: "Stack",
    },
    {
      id: "experience",
      to: "/",
      section: "experience",
      name: "Experience",
    },
    {
      id: "about",
      to: "/",
      section: "about",
      name: "About",
    },
    {
      id: "contact",
      to: "/",
      section: "contact",
      name: "Contact",
    },
  ]);

  return { links, activeSection };
}
