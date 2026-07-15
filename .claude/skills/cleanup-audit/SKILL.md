---
name: cleanup-audit
description: Audit this portfolio codebase for dead files, unused dependencies, unused public assets, stale documentation, config/lockfile drift, and bundle-size issues. Use when asked to "clean up", "find dead code", "remove unused files/deps", or do general repo hygiene on this project. Reports findings by category and asks before deleting anything that isn't unambiguously dead.
---

# Cleanup audit

Methodology for finding and safely removing dead code/assets in this Vue 3 + Vite portfolio. Work through the checks below, then present findings grouped by category (dead files / dead deps / unused assets / stale docs / config drift / bundle size) before deleting anything non-obvious. See `git log` for a prior full pass if you want a reference of what "done" looks like.

## 1. Dead files

For each `.vue`/`.js` file in `src/` (excluding entry points `App.vue`, `main.js`, `router/index.js`), grep the rest of `src/` for its basename minus extension:

```bash
for f in $(find src -type f \( -name "*.vue" -o -name "*.js" \)); do
  base=$(basename "$f"); name="${base%.*}"
  count=$(grep -rl "$name" src --include="*.vue" --include="*.js" | grep -v "^$f$" | wc -l)
  echo "$count refs -> $f"
done | sort -n
```

Zero hits = candidate for deletion, but verify manually:
- A file only referenced inside a **comment** (e.g. a commented-out import) is still dead — `grep` will show 1 ref, read the actual line.
- A component that **reimplements another's behavior inline** instead of using it (duplicate, not reuse) counts as dead too, not just literal zero-ref files. Read the "1 ref" files, not just the zero-ref ones, when something looks like it should be shared.

## 2. Dead composables / data

Grep for the composable's exported function name (e.g. `useInfo`, `useFileManager`) across `src/`. If the only hit is its own definition, it's unused — even if it holds real content (testimonials, copy, social links). **Real content needs a user decision before deleting**, not an automatic delete — it may be staged for a feature that isn't wired up yet.

## 3. Dead dependencies

For every entry in `package.json` `dependencies`/`devDependencies`, grep `src/` for the import name. No hits = unused. Confirm by removing it and running `npm install` (lockfile updates) + `npm run build` (still compiles).

Also check for *overkill* dependencies, not just unused ones — e.g. a whole ID-generation library (`uuid`) used only to stamp IDs on a small hardcoded array is a simplification opportunity even though it's "used": replace with plain string/number ids and drop the dependency.

## 4. Unused public assets

For every file under `public/`, grep `src/` and `index.html` for its filename:

```bash
for f in public/icons/*.svg; do
  name=$(basename "$f")
  grep -rq "$name" src index.html 2>/dev/null || echo "UNUSED: $f"
done
```

Do the same for `public/testimonials/`, `public/vectors/`, etc. Watch for dynamic path construction (template literals like `` `/icons/${x}.svg` ``) that a literal filename grep would miss — check the referencing composable's data shape before concluding an asset is truly orphaned.

## 5. Stale documentation

Cross-check `CLAUDE.md` and `README.md` claims (routes, features, composables list) against the actual router (`src/router/index.js`) and `src/composables/` directory contents. Docs describing removed features (e.g. an old file-browser About page) are a common drift source after refactors — update or remove those sections rather than leaving them to mislead the next session.

## 6. Config / lockfile drift

Check whether `Dockerfile` and the lockfiles present (`package-lock.json` / `pnpm-lock.yaml`) agree on the same package manager, and check lockfile modification dates against each other. Two lockfiles usually means a silent local migration happened (e.g. dev moved from pnpm to npm without updating Docker). Pick one — prefer whichever matches the *newer* lockfile / what's actually being used locally — delete the other, update `Dockerfile` accordingly, and verify with a real `docker build -t tmp-test . && docker rmi tmp-test`.

Also check `.env` vs `.example.env`: grep `src/`, `vite.config.js`, and `Dockerfile` for `import.meta.env`/`process.env` usage of each declared var. Unused vars and an empty/out-of-sync example file are dead config.

## 7. Bundle size

Run `npm run build` and check for Vite's "chunk larger than 500 kB" warning.

- Default cause in this app: `src/router/index.js` statically importing every page, so the whole app (including heavy libs like Three.js) ships in one bundle regardless of route. Fix: convert page imports to `() => import("../pages/x.vue")` for route-level code splitting.
- If one heavy chunk remains after splitting (e.g. a Three.js vendor chunk), check it's isolated to the route that actually needs it. Don't assume tree-shaking will help — test it: swap a component's `import * as X from "lib"` for named imports of only what's used, rebuild, and diff the chunk size byte-for-byte. If the size doesn't move, the library's own internals (e.g. `WebGLRenderer` pulling in most of Three.js's core) are the real floor, and further reduction means a different library or a rewrite, not an import-style tweak.
- If the remaining chunk is confirmed near-optimal and correctly isolated, raise `build.chunkSizeWarningLimit` in `vite.config.js` rather than chasing an unreachable reduction — but say so explicitly, don't silently hide a real regression.

## 8. Verify after every deletion round

- `npx eslint src/` — confirm no *new* errors (note pre-existing unrelated errors, don't attribute them to your change)
- `npm run build` — confirm it still succeeds; check the chunk list for surprises
- If `Dockerfile` or a lockfile changed: run an actual `docker build`, not just `npm run build`
- If routing changed: `npx vite preview` + `curl -o /dev/null -w "%{http_code}" <route>` for each route, confirming 200s
- For visual/UX changes, a build/lint pass is not enough — say explicitly that it wasn't visually verified if you can't drive a real browser

## Ground rules

- Never delete real content (testimonials, copy, user-facing text) without asking, even if it's technically unreferenced.
- Never silently "fix" a product/UX decision uncovered during cleanup (e.g. nav links intentionally hidden) — flag it as a question, don't change it unless told to.
- Batch findings into categories and ask before deleting each category, rather than deleting everything found in one pass — some categories (dead files) are safe to act on immediately once verified zero-ref; others (real content, product behavior) are not.
