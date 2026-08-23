# Design system

Reference for the visual language already in use across the site — colors, type, spacing, and the recurring UI patterns. Pull from this when building new pages (e.g. the future projects/contact rebuild) instead of inventing new tokens.

## Concept

A dark-terminal aesthetic: monospace type throughout, a navy-black base, muted blue-grey body text, and a small set of syntax-highlight-style accent colors (a coral/red, a violet-blue, a mint/teal, an amber) used the way a code editor uses them — for links, active states, and emphasis, never as large fields of color.

## Color

All colors are CSS custom properties on `:root` (`src/style.css`), consumed through Tailwind tokens (`tailwind.config.js`) — e.g. `bg-theme-main`, `text-accent-url`. Never hardcode a hex value in a component; add a token instead so both themes (and every palette) stay in sync. `TerminalWindow.vue`'s panel background used to be a hardcoded navy `rgba()` that ignored both — fixed to read `var(--color-bg-field-default)` instead; treat any new hardcoded color the same way.

Light is the current default (flip `useTheme.js`'s fallback to change it back); dark remains a real second theme, not an afterthought, toggled via `data-theme="light"`/`"dark"` on `<html>` (`useTheme.js`, persisted to `localStorage`). Light-mode accent values are independently darkened/saturated to clear WCAG AA (4.5:1) against the light background — verified with contrast math, not eyeballed.

### Palettes — the color-scheme "connector"

The token values below are no longer the only source of truth. `src/composables/palettes.js` holds a registry of named palettes (currently `terminal` — the original navy/coral/mint values in the table below, still on disk in `style.css` untouched — and `dreamPastel`, the active default), each with a full dark/light token set plus `grid` colors for `SpaceTimeGrid.vue`'s WebGL background. `src/composables/usePalette.js` applies the active one as inline custom-property overrides on `<html>`, which win over `style.css`'s own `:root` block. To add a scheme: add an entry to `PALETTES` (same shape) — no CSS edits, nothing existing removed. To switch: `setPalette("name")`, or change `DEFAULT_PALETTE`.

The table below documents the `terminal` palette specifically (still the on-disk CSS fallback); check `palettes.js` for whatever palette is actually active.

| Token | Dark | Light | Used for |
|---|---|---|---|
| `--color-theme-main` | `#011627` | `#eff4f8` | Page background |
| `--color-accent-color` | `#607b96` | `#52697d` | Secondary/muted UI (scrollbar thumb, icons) |
| `--color-accent-sub` | `#4d5bce` | `#4049b0` | Subheadings, secondary accent |
| `--color-accent-url` | `#e99287` | `#b14a3d` | Links, active nav indicator |
| `--color-accent-variable` | `#43d9ad` | `#097a5d` | Terminal `$` prompt, caret, highlight |
| `--color-accent-underline` | `#fea55f` | `#a85519` | Underlines / tertiary accent |
| `--color-border-white` | `#1e2d3d` | `#d7e0e7` | Hairline borders |
| `--color-white-gradient-01` | `#e5e9f0` | `#011627` | Primary text (the two themes swap brand-navy between bg and ink) |
| `--color-gray-gradient-01` | `#607b96` | `#52697d` | Secondary text |
| `--color-bg-field-default` | `#011221` | `#ffffff` | Form field background |
| `--color-bg-button-default` | `#1c2b3a` | `#4049b0` | Primary button background |

`--color-code-keyword` / `--color-code-rest` / `--color-code-id` are defined for code-style syntax coloring but currently have no consumers in `src/` — available for a future code-snippet or CV-style page.

Mini-games (`SnakeGame.vue`, `SudokuGame.vue`, `TetrisGame.vue`) and `CustomCursor.vue`'s hover-label chip still use hardcoded hex rather than tokens — a pre-existing, deliberate choice (the games "keep their current dark look for now rather than getting a light-mode pass," per the maintenance note below) rather than an oversight. Leave them as-is unless asked to theme them too.

`--color-theme-main-gradient` is deliberately **not** re-themed for light mode — its only consumer (SnakeGame's canvas) intentionally keeps its dark look regardless of site theme.

## Typography

One typeface everywhere: **Fira Code** (monospace), loaded via Google Fonts in `index.html` and set as `sans`, `mono`, and `serif` in `tailwind.config.js` — so any Tailwind font-family utility resolves to the same face. This is a deliberate constraint, not a gap: the whole site reads as a code editor / terminal, so there's no separate display or body face.

Sizing uses Tailwind's default type scale plus two custom additions (`fontSize` in `tailwind.config.js`): `3xl` → `2rem`, `6xl` → `3.875rem`. Headings lean on responsive scaling (`text-4xl md:text-5xl xl:text-6xl` on the landing `<h1>`) rather than fixed sizes.

Body copy and UI labels frequently read as code (`// comments`, `const x =`, `$` prompts) — this is a content convention as much as a type one; new copy should keep that voice where it fits naturally, not be forced everywhere.

## Spacing & shape

- Standard Tailwind spacing scale, with a few extensions for specific layouts: `margin.82` (5.125rem), `gap.92` (5.75rem), `inset.7/9/11` (7/9/11rem) — all defined because a default Tailwind step didn't land exactly right somewhere; check `tailwind.config.js` before adding a new one-off value.
- `borderRadius.sm` is overridden to `8px` (Tailwind's default `sm` is much smaller) — the base "small rounded corner" across cards, inputs, buttons.
- Pill/fully-rounded shapes (`rounded-full` / large radii) are reserved for floating chrome — the nav dock, the terminal's macOS-style traffic-light dots — not for content cards.

## Scrollbars

Three custom utilities from a Tailwind plugin (`tailwind.config.js`), themed through the same color tokens:
- `.scrollbar-custom` — 8px, visible track + thumb (used for larger scrollable panels)
- `.scrollbar-thin` — 4px, transparent track (used inside the terminal output)
- `.scrollbar-none` — fully hidden

## Recurring UI patterns

- **Terminal window chrome** (`TerminalWindow.vue`) — a macOS-style dot row (red/yellow/green), a `user@portfolio ~ $` label, monospace output, and a blinking-caret input with no focus ring (the caret itself signals focus — a deliberate choice, not a missed a11y fix).
- **Floating nav pill** (`Navbar.vue`) — a frosted-glass (`backdrop-filter: blur`), gradient-bordered pill that docks bottom-center on mobile and left-center vertically on desktop, with a sliding active-indicator bar measured from the DOM.
- **Custom cursor** (`CustomCursor.vue`) — replaces the system cursor site-wide with an SVG arrow plus a contextual label sourced from `data-cursor` attributes on hovered elements.
- **Decorative corner accents** — small bolt/blob SVGs (`public/icons/bolt-*.svg`, `public/vectors/Green.svg` / `Blue.svg`) placed with `alt=""` around game panels (Snake/Sudoku/Tetris) as ambient decoration, not content.
- **Inline "code" styling for real UI** — e.g. the theme toggle is a `<button>` sitting *inside* the `<h1>` text ("Abhira**h**na M"), styled to look like part of the word rather than a separate control.

## What NOT to do

- Don't hardcode hex colors in a component — extend the token set in `style.css` + `tailwind.config.js` instead, in both theme blocks.
- Don't introduce a second typeface. If a future page needs visual differentiation, do it with weight/size/color within Fira Code, not a new font.
- Don't reach for sharp corners on floating chrome or heavy rounding on content — keep the radius convention above.
