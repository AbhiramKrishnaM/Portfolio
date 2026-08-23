import { ref, watchEffect } from "vue";
import { useTheme } from "@/composables/useTheme.js";
import { PALETTES, DEFAULT_PALETTE, TOKEN_TO_CSS_VAR } from "@/composables/palettes.js";

const PALETTE_KEY = "palette";

const stored =
  typeof localStorage !== "undefined" ? localStorage.getItem(PALETTE_KEY) : null;
const palette = ref(stored && PALETTES[stored] ? stored : DEFAULT_PALETTE);

// Every palette — including "terminal" — is applied the same way: as inline
// custom-property overrides on <html>, which win the cascade over the
// stylesheet's own :root block. That block stays untouched on disk as the
// no-JS fallback; switching palettes never edits or deletes it.
function applyPalette(name, themeMode) {
  if (typeof document === "undefined") return;
  const root = document.documentElement.style;
  const scheme = PALETTES[name] ?? PALETTES[DEFAULT_PALETTE];
  const tokens = { ...scheme.dark, ...(themeMode === "light" ? scheme.light : {}) };

  for (const [key, value] of Object.entries(tokens)) {
    const cssVar = TOKEN_TO_CSS_VAR[key];
    if (cssVar) root.setProperty(cssVar, value);
  }
}

const { theme } = useTheme();

watchEffect(() => {
  applyPalette(palette.value, theme.value);
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(PALETTE_KEY, palette.value);
  }
});

export function usePalette() {
  function setPalette(name) {
    if (PALETTES[name]) palette.value = name;
  }

  return { palette, setPalette, palettes: PALETTES };
}
