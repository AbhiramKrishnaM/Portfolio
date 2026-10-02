import { ref, watchEffect } from "vue";
import { unlock } from "@/composables/achievements.js";

const THEME_KEY = "theme";

function readStoredTheme() {
  try {
    return localStorage.getItem(THEME_KEY);
  } catch {
    return null;
  }
}

function storeTheme(value) {
  try {
    localStorage.setItem(THEME_KEY, value);
  } catch {
    return;
  }
}

const theme = ref(readStoredTheme() === "light" ? "light" : "dark");

function applyTheme(value) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", value);
}

applyTheme(theme.value);

watchEffect(() => {
  applyTheme(theme.value);
  storeTheme(theme.value);
});

export function useTheme() {
  function toggleTheme() {
    theme.value = theme.value === "dark" ? "light" : "dark";
    unlock("theme");
  }

  return { theme, toggleTheme };
}
