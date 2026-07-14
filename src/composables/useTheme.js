import { ref, watchEffect } from "vue";

const THEME_KEY = "theme";

const stored =
  typeof localStorage !== "undefined" ? localStorage.getItem(THEME_KEY) : null;
const theme = ref(stored === "light" ? "light" : "dark");

function applyTheme(value) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", value);
}

applyTheme(theme.value);

watchEffect(() => {
  applyTheme(theme.value);
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(THEME_KEY, theme.value);
  }
});

export function useTheme() {
  function toggleTheme() {
    theme.value = theme.value === "dark" ? "light" : "dark";
  }

  return { theme, toggleTheme };
}
