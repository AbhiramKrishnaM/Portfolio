# TODO — week of 2026-10-12

Last week's finished work is archived in `docs/archive/todo-2026-10-week1.md`.

## 1. Ship last week's work
- [x] Commit + push the performance / accessibility fixes so the live site picks them up
- [x] Turn on auto-renew for abhiramkrishna.com in Namecheap

## 2. Projects — real content (was #4)
- [ ] **[Abhiram to provide]** For each project: name, one-line description, tech, live/GitHub link, screenshot
- [ ] Add OCSF-Toolkit (from the resume) as a project
- [ ] Replace the placeholders in `src/data/projects.js`
- [ ] Show the screenshots in the project card

## 3. WebGL hover on project images (was #12)
- [ ] Reuse the glass-name lens shader on the project card image
- [ ] Animate in on hover, ease back on leave
- [ ] Plain image fallback when WebGL isn't available

## 4. Resume download (was #23)
- [ ] **[Abhiram to provide]** Corrected PDF: real email (not `mail@abhiram.com`), decide on the phone number
- [ ] Add it to `public/` and set `RESUME.url` in `src/data/profile.js`

## 5. Experience months (was #19)
- [ ] **[Abhiram to provide]** Exact start/end months for Neolen and Caprimul

## 6. Sky above the grid (was #28)
- [ ] Soft horizon glow where the grid meets the sky
- [ ] Sparse starfield that fades in at night and out during the day (day/night palette)
- [ ] Keep it calm — no pixel/dither noise over the grid

## 7. Photo particles in About (was #27)
- [ ] Reference: https://tympanus.net/codrops/2019/01/17/interactive-particles-with-three-js/
- [ ] **[Abhiram to provide]** iPhone photo: plain or dark background, good light, head + shoulders, roughly square
- [ ] Turn the photo into particles that scatter under the cursor and re-form
- [ ] Lazy-load when About scrolls in; plain photo on mobile / no WebGL

## 8. Spotify "now playing" (was #8)
- [ ] **[Abhiram to provide]** Create a Spotify developer app (I'll walk you through it)
- [ ] Small Vercel serverless function that holds the token and returns the current track
- [ ] Show it in the `now` command

## 9. Keyboard → character formation fixes (Stack)
- [ ] Many characters form wrong or incomplete (e.g. `?` missing its top-left keys while the screen shows `?`) — find why some keys never reach their cell and fix it
- [ ] Every glyph (`# @ 1 2 3 4 5 $ & % * ? !`) should read clearly; check each one
- [ ] Make the formation smaller
- [ ] Re-check it stays clear of the "Stack" heading and the box

## 10. Publish the GitHub contributions skyline as an npm package
- [ ] Pick a name and check it's free on npm (e.g. `contribution-skyline`)
- [ ] Extract the 3D bars + twinkle + burst particles out of `SpaceTimeGrid` into a standalone three.js module
- [ ] Keep the flat calendar (`ContributionCalendar.vue`) as the lightweight 2D option
- [ ] Input: a GitHub **username** — fetch public contributions with no token by default; optional GitHub token only for private contributions
- [ ] Never ship a token to the browser — document a tiny server/serverless helper (or build-time script like `scripts/fetch-contributions.mjs`) for fetching
- [ ] Framework-agnostic core + thin wrappers (Vue component, React component, Web Component)
- [ ] Options: colours/theme, bar height scale, twinkle on/off, bursts on/off, reduced-motion fallback
- [ ] README with a live demo, install + usage examples, and screenshots
- [ ] Bundle (ESM + types), set `three` as a peer dependency, add a demo page, publish to npm
- [ ] Use the published package back in this portfolio

## 11. Publish the spacetime grid as an npm package
- [ ] Pick a name and check it's free on npm (e.g. `spacetime-grid`)
- [ ] Extract the grid out of `SpaceTimeGrid.vue` into a standalone three.js module (no Vue, no portfolio-specific scroll/story code)
- [ ] Keep the core effects: idle waves, cursor gravity well, click ripples, fog, theme colours
- [ ] Make the extras opt-in plugins/hooks: camera poses per section, extra wells (e.g. a moving element), impulses, data overlays (like the contribution bars from task 10)
- [ ] Options: grid size/density, colours, wave strength, well radius/depth, ripple speed, pixel ratio cap, reduced-motion fallback
- [ ] Keep the per-tile tick fast (precomputed sin/cos, no allocations) and pause when off-screen
- [ ] Framework-agnostic core + thin wrappers (Vue, React, Web Component)
- [ ] README with a live demo, usage examples, screenshots
- [ ] Bundle (ESM + types), `three` as a peer dependency, publish to npm
- [ ] Use the published package back in this portfolio
