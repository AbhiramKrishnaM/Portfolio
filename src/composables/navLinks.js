import { ref } from "vue";

// Id of the in-page section currently in view (e.g. "projects"), or null.
// Set by the landing page's scroll triggers, read by Navbar to highlight the
// matching link. Module-level so every caller shares the same state.
const activeSection = ref(null);

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
