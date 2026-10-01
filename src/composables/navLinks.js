import { ref } from "vue";

// Id of the in-page section currently in view (e.g. "projects"), or null.
// Set by the landing page's scroll triggers, read by Navbar to highlight the
// matching link. Module-level so every caller shares the same state.
const activeSection = ref(null);

/**
 * Smooth-scrolls to an in-page section by id. If that element is hidden at the
 * current breakpoint, falls back to a visible `[data-section-fallback="<id>"]`
 * stand-in (e.g. the project card under the terminal on mobile). Returns
 * false if nothing visible was found.
 */
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
  // `section` links scroll to an element id on `to` instead of navigating.
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
