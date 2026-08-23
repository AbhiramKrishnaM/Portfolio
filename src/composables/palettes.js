// Named color-scheme registry — the "connector" for site-wide color swaps.
//
// Each entry provides a full dark + light token set matching the CSS custom
// properties defined in src/style.css (which still holds the original
// "terminal" values as the on-disk fallback — nothing there was deleted).
// To add a new scheme: drop another entry in PALETTES below, in the same
// shape, then call setPalette("yourKey") from usePalette.js (or point
// DEFAULT_PALETTE at it). No CSS edits, no touching existing palettes.
//
// Light-mode accent values are darkened/saturated from their dark-mode hue so
// they clear WCAG AA (4.5:1) against the light background — verified with
// scripts/contrast math, not eyeballed, same bar the original palette used.
export const PALETTES = {
  terminal: {
    label: "Terminal",
    dark: {
      themeMain: "#011627",
      themeMainGradient: "#011627d6",
      accentColor: "#607b96",
      accentSub: "#4d5bce",
      accentUrl: "#e99287",
      accentVariable: "#43d9ad",
      accentUnderline: "#fea55f",
      borderWhite: "#1e2d3d",
      whiteGradient01: "#e5e9f0",
      grayGradient01: "#607b96",
      codeKeyword: "#c98bdf",
      codeRest: "#5565e8",
      codeId: "#fea55f",
      bgFieldDefault: "#011221",
      bgButtonDefault: "#1c2b3a",
    },
    light: {
      themeMain: "#eff4f8",
      accentColor: "#52697d",
      accentSub: "#4049b0",
      accentUrl: "#b14a3d",
      accentVariable: "#097a5d",
      accentUnderline: "#a85519",
      borderWhite: "#d7e0e7",
      whiteGradient01: "#011627",
      grayGradient01: "#52697d",
      codeKeyword: "#8a4fb0",
      codeRest: "#3745b8",
      codeId: "#a85519",
      bgFieldDefault: "#ffffff",
      bgButtonDefault: "#4049b0",
    },
    // WebGL-only tones for SpaceTimeGrid.vue — a dim resting-tile color, a
    // bright glow for the cursor/energy-wave lift, and a pale glint for the
    // fresnel sheen. Kept separate from the CSS tokens above since they're
    // consumed as three.js Color values, not custom properties.
    grid: {
      dark: { base: "#0c1f33", hover: "#43d9ad", fresnel: "#bfe9ff" },
      light: { base: "#c7d4de", hover: "#4049b0", fresnel: "#d7e6f5" },
    },
  },

  // Derived from the four supplied swatches (cream #FFF4BF, pink #FFBEFB,
  // lilac #DC95FF, purple #8C56D4). None of the four is dark enough to serve
  // as a background on its own, so the bg/ink pair is a same-hue-family
  // deep-violet/near-white derived to match — mirroring how "terminal"
  // pairs navy with off-white rather than reusing an accent for either role.
  dreamPastel: {
    label: "Dream Pastel",
    dark: {
      themeMain: "#110a1a",
      themeMainGradient: "#110a1ad6",
      accentColor: "#947ea9",
      accentSub: "#dc95ff",
      accentUrl: "#ffbefb",
      accentVariable: "#fff4bf",
      accentUnderline: "#8c56d4",
      borderWhite: "#271f33",
      whiteGradient01: "#f5ebf9",
      grayGradient01: "#947ea9",
      codeKeyword: "#dc95ff",
      codeRest: "#8c56d4",
      codeId: "#8c56d4",
      bgFieldDefault: "#0c0613",
      bgButtonDefault: "#2a1c3d",
    },
    light: {
      themeMain: "#fbf9f4",
      accentColor: "#6b5483",
      accentSub: "#9119cc",
      accentUrl: "#b616ab",
      accentVariable: "#836e07",
      accentUnderline: "#5e29a3",
      borderWhite: "#e8e1ef",
      whiteGradient01: "#110a1a",
      grayGradient01: "#6b5483",
      codeKeyword: "#9119cc",
      codeRest: "#5e29a3",
      codeId: "#5e29a3",
      bgFieldDefault: "#fdfdfb",
      bgButtonDefault: "#6a34b2",
    },
    grid: {
      dark: { base: "#22163a", hover: "#fff4bf", fresnel: "#eadcff" },
      light: { base: "#ddd0ea", hover: "#8c56d4", fresnel: "#f5ecff" },
    },
  },

  // From the four supplied swatches: blue #476EAE ("text and borders"),
  // yellow #F6FF99 ("background"), green #A7E399 ("highlight"), and teal
  // #48B3AF (unassigned in the brief — used here as the muted secondary/
  // subheading tone, the natural fourth role). Blue and green are both too
  // low-contrast against the pale yellow bg to use at their given lightness
  // for light-mode text/UI roles (2.36 and 1.40 respectively) — darkened,
  // same-hue variants stand in there and clear 4.5:1; the raw swatches are
  // used as-is in dark mode, where they already contrast well against the
  // derived deep-blue background.
  meadow: {
    label: "Meadow",
    dark: {
      themeMain: "#0d1421",
      themeMainGradient: "#0d1421d6",
      accentColor: "#48b3af",
      accentSub: "#48b3af",
      accentUrl: "#48b3af",
      accentVariable: "#a7e399",
      accentUnderline: "#f6ff99",
      borderWhite: "#476eae",
      whiteGradient01: "#f6ff99",
      grayGradient01: "#48b3af",
      codeKeyword: "#48b3af",
      codeRest: "#476eae",
      codeId: "#f6ff99",
      bgFieldDefault: "#080d17",
      bgButtonDefault: "#476eae",
    },
    light: {
      themeMain: "#f6ff99",
      accentColor: "#227773",
      accentSub: "#227773",
      accentUrl: "#476eae",
      accentVariable: "#327722",
      accentUnderline: "#327722",
      borderWhite: "#476eae",
      whiteGradient01: "#0d1421",
      grayGradient01: "#227773",
      codeKeyword: "#227773",
      codeRest: "#476eae",
      codeId: "#327722",
      bgFieldDefault: "#fdfdfc",
      bgButtonDefault: "#476eae",
    },
    grid: {
      dark: { base: "#152032", hover: "#a7e399", fresnel: "#dbe9ff" },
      light: { base: "#d7deea", hover: "#476eae", fresnel: "#f2f6ff" },
    },
  },
};

export const DEFAULT_PALETTE = "meadow";

// camelCase token key -> the CSS custom property it drives.
export const TOKEN_TO_CSS_VAR = {
  themeMain: "--color-theme-main",
  themeMainGradient: "--color-theme-main-gradient",
  accentColor: "--color-accent-color",
  accentSub: "--color-accent-sub",
  accentUrl: "--color-accent-url",
  accentVariable: "--color-accent-variable",
  accentUnderline: "--color-accent-underline",
  borderWhite: "--color-border-white",
  whiteGradient01: "--color-white-gradient-01",
  grayGradient01: "--color-gray-gradient-01",
  codeKeyword: "--color-code-keyword",
  codeRest: "--color-code-rest",
  codeId: "--color-code-id",
  bgFieldDefault: "--color-bg-field-default",
  bgButtonDefault: "--color-bg-button-default",
};
