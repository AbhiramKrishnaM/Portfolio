# TODO — this week

## 1. More space between navbar and terminal on scroll
- [x] Check where the terminal lands after scrolling (the dock in section 2 of `index.vue`)
- [x] Add left padding to the dock so it clears the vertical navbar pill (`lg:pl-32 xl:pl-36`)
- [x] Check it on lg, xl, and 2xl screens

## 2. Terminal switches to `$ projects` on scroll
- [x] Add a projects data list (name, short description, link)
- [x] Add a `projects` command in `useCLI.js` that prints the list
- [x] Add a way to clear the intro and type `projects` with the existing typing animation
- [x] Show projects one by one (small delay between each)
- [x] Trigger it with a ScrollTrigger when the terminal reaches the projects section
- [x] Scrolling back up restores the intro (`whoami` + `ls socials`)
- [x] Fast up/down scrolling shouldn't jumble the typing animation
- [x] Don't switch to projects while a game is being played
- [x] Add `projects` to the `help` list

## 3. Projects link in navbar
- [x] Add a Projects entry to `navLinks.js`
- [x] Clicking it scrolls smoothly to the projects section
- [x] Highlight the link while the projects section is in view

## 4. Project preview card next to the terminal
- [x] Build a `ProjectCard` component (label `Project N // _slug`, preview image, tech icon badge, description, `view-project` button)
- [x] Add placeholder data for each project (image, slug, description, tech, link)
- [ ] **[Abhiram to provide]** Real project details to replace placeholders: name, slug, description, tech, live/GitHub link, screenshot
- [x] Place the card in the empty space right of the docked terminal
- [x] Keep it hidden on the hero; fade it in only once the terminal lands on the projects section
- [x] Hide it again when scrolling back up
- [x] Show the first project by default
- [x] Hovering/clicking a project in the terminal list swaps the card to that project
- [x] Smooth transition when the card swaps
- [x] On mobile, show the card below the terminal

## 5. Fun terminal commands
- [x] `sudo hire-me` — cheeky reply + contact links
- [x] `cowsay <text>` — ASCII cow says the text
- [x] `fortune` — random dev quote/joke
- [x] `sl` — ASCII train drives across the terminal
- [x] `matrix` — falling code rain inside the terminal, any key exits
- [x] `vim` — trap mode, only `:q!` gets you out
- [x] Keep these out of `help` (let people discover them) or add a `// secret` hint

## 6. Command palette (Cmd/Ctrl + K)
- [x] Build a `CommandPalette` modal (search input + list)
- [x] Items: jump to projects, socials, games, toggle theme
- [x] Keyboard nav (↑/↓, Enter, Esc)
- [x] Open with Cmd/Ctrl + K from anywhere on the page
- [x] Style it like the terminal chrome (see `DESIGN.md`)

## 7. `git log` command (real GitHub activity)
- [x] Fetch recent public commits from the GitHub API
- [x] Print them like `git log --oneline` (hash, message, repo, time ago)
- [x] Cache the result so it doesn't hit the API on every run
- [x] Show a friendly message if the API fails or rate-limits

## 8. `now` command (what I'm up to)
- [x] Add a `now` command: currently building / learning / listening to
- [x] Start with static text in a composable
- [ ] Later: pull "listening to" from the Spotify API

## 9. Easter eggs
- [x] Konami code (↑↑↓↓←→←→BA) triggers chaos mode / confetti
- [x] Achievements: unlock badges for trying commands, finishing a game, finding secrets
- [x] Show a small toast in the corner when one unlocks
- [x] Save unlocked achievements in `localStorage`
- [x] `achievements` command lists unlocked / locked ones

// version 2 next week updates
## 10. Gravity well in the spacetime grid
- [x] Pass the cursor position into `SpaceTimeGrid.vue` (as a shader uniform)
- [x] Bend the grid down around the cursor like a mass warping space
- [x] Add a second, heavier "mass" that follows the terminal while it flies down
- [x] Ease the warp in/out so it feels smooth, not jumpy
- [x] Turn it off on touch devices / low-power mode

## 11. Scroll-driven camera flight
- [x] Decide a camera position for each section (hero, projects, …)
- [x] Move the grid camera between them with a GSAP ScrollTrigger
- [x] Sync it with the existing terminal motion path so both move together
- [x] Keep the page usable on mobile (simpler or no camera move)

## 12. WebGL hover effect on project images
- [ ] Pick the effect (liquid warp or RGB split)
- [ ] Render the project card image on a WebGL plane/canvas
- [ ] Animate the effect on hover, ease back on leave
- [ ] Fall back to a plain image if WebGL isn't available

## 13. Glass refraction on the hero name
- [x] Reference: https://www.dorianlods.fr/ (match this feel)
- [x] Use the 2D lens shader approach (name drawn to a WebGL texture, bent around the cursor)
- [x] Add subtle rainbow edge split (chromatic aberration)
- [x] Prototype the glass/refraction effect on the name text
- [x] Make the distortion follow the cursor
- [x] Keep the real `h1` text in the DOM for SEO and screen readers
- [x] Make sure the theme-toggle "h" still works

## 14. Tech stack physics pile
- [x] Add a new Stack section right after projects
- [x] Keep the terminal pinned on the left from projects through stack
- [x] Use the right side as the physics area (same spot as the project card)
- [x] On scroll into stack, terminal clears and types `$ ls stack`
- [x] Pick the engine (Matter.js for 2D or Rapier for 3D)
- [x] Make tech logos (Vue, React, Node, Python, Docker, AWS) physics bodies
- [x] Logos tumble out of the `node_modules` box (see task 24) and pile up on the floor
- [x] Let people grab and throw them with the mouse
- [x] Logos stay piled while in stack; they get repacked into the box when leaving (task 24)
- [x] Add a "Stack" navbar link and an `ls stack` command
- [x] Static logo grid on mobile and for reduced-motion users
- [x] Lazy-load the physics engine so it doesn't slow the landing page

## 15. Day/night mode from local time
- [ ] Read the visitor's local time
- [ ] Define looks for dawn / day / dusk / night (grid color, glow, background)
- [ ] Blend smoothly between them
- [ ] Theme toggle still overrides it manually

## 16. Remove code comments
- [x] Remove comments from all files in `src/`
- [x] List any comment that seems truly needed and get approval before keeping it
- [x] Run `npx eslint src/` and `npm run build` after to make sure nothing broke
- [x] Rule going forward: no comments in new code unless approved

## 17. Codebase audit — remove unwanted code
- [x] Run the `cleanup-audit` skill (dead files, unused deps, unused assets, stale docs)
- [x] Find unused functions, variables, props, and CSS classes inside files
- [x] Find leftover code like the hidden icosahedron (`SHOW_ICOSAHEDRON = false`)
- [x] Review the list together before deleting anything
- [x] Lint + build + click through the site after each round

## 18. Refactor for readability
- [x] Split `index.vue` by behaviour (hero text animation, terminal scroll motion, game switching)
- [x] Move that logic into composables (e.g. `useHackingText`, `useTerminalScroll`)
- [x] Split `useCLI.js` into commands, intro animation, and game registry
- [x] Clear, consistent names for files, functions, and variables
- [x] Keep components small: one job per file
- [x] Update `CLAUDE.md` / `README.md` so a new dev can find things quickly
- [x] Lint + build + click through the site to confirm nothing changed visually

## 19. Experience section
- [x] Experience data: company, role, duration, impact points (in `src/data/experience.js`)
- [ ] **[Abhiram to provide]** Exact start/end months for each job (only durations so far)
- [x] Build a timeline-style section on the page
- [x] Add an `experience` terminal command that prints the same data
- [x] Add it to the navbar and `help`

## 20. About section
- [ ] **[Abhiram to provide]** Short About story: background, what I care about, a bit of personality (guitar!)
- [x] Add an About section on the page
- [x] Expand `whoami` or add `cat about.txt` in the terminal
- [x] Add it to the navbar

## 21. Contact call to action
- [x] Add a clear "let's talk" section near the end of the page
- [x] Copy-email-to-clipboard button with a "copied" toast
- [x] Add a `contact` terminal command
- [x] Add it to the navbar

## 22. Footer
- [x] Build a `Footer` component: socials, email, copyright
- [x] Add a closing line ("let's build something together")
- [x] Match the terminal style from `DESIGN.md`

## 23. Resume download
- [ ] **[Abhiram to provide]** Resume PDF (then add it to `public/`)
- [x] Add a "download resume" button (hero or navbar)
- [x] Add a `resume` terminal command that opens/downloads it

## 24. `node_modules` box story (projects → stack → contact)
- [x] Reference: https://tympanus.net/codrops/2022/12/13/how-to-code-an-on-scroll-folding-3d-cardboard-box-animation-with-three-js-and-gsap/
- [x] Box code source: https://github.com/uuuulala/Threejs-folding-cardboard-box-tutorial (MIT, built in code, no model file)
- [x] Port its `main.js` box code into a Vue component, update for three 0.180 (`mergeBufferGeometries` → `mergeGeometries`)
- [x] Keep the MIT license notice + credit to Ksenia Kondrashova / Codrops
- [x] Draw the `node_modules` label and stamps on canvas textures (same trick the demo uses)
- [x] Projects: box appears sealed near the terminal (left)
- [x] Projects: on scroll, box slides left → right while the tape peels and flaps unfold
- [x] Stack: box lands open on the right, logos tumble out into the physics pile (task 14)
- [x] Leaving stack: box shrinks and jumps back to the left
- [x] Experience + About: small box travels left → right (conveyor belt) while packing
- [x] Packing is visible: logos fly back in one by one, flaps fold, tape seals the top
- [x] Time it so packing finishes exactly as Contact arrives
- [x] Keep the small box out of the way of Experience/About content
- [x] Contact: box grows big, sitting slightly off-center to the right
- [x] Contact: stamps hit in sequence with a thud/shake (`FRAGILE` → `node_modules` → `FROM: abhiram` → `SHIPPED`)
- [x] Then the "let's talk" CTA appears (task 21)
- [x] Make sure the box doesn't cover the project card while it moves
- [x] Scroll back up reverses everything cleanly
- [x] Simple fallback on mobile / reduced motion (static box image or skip)

## 25. Better notifications (replace `AchievementToast`)
- [x] Use `vue-sonner` (Vue port of Sonner: stacking, swipe to dismiss, smooth animations)
- [x] Replace `AchievementToast.vue` + the manual `toastQueue` with `toast()` calls
- [x] Drop the left accent-stripe card look
- [x] Style it to match the terminal (Fira Code, theme colors from `DESIGN.md`, light + dark)
- [x] Reuse it for other toasts (e.g. "email copied" in task 21)

## 26. Intro loader (letter wall → name)
- [x] Reference: https://www.eugeniagrab.com/en (intro animation)
- [x] Build a `PageLoader` component: 5 rows of random Fira Code characters
- [x] Hide `ABHIRAM` + `KRISHNA` in the middle row with filler letters between them
- [x] Random letters slide in in random order; name letters slide in left → right
- [x] Fade filler letters to gray so the name pops
- [x] Filler slides out, letters between first/last name collapse, name snaps together
- [x] Exit with a Bayer dither wipe that reveals the page
- [x] Keep it ~2–3s total
- [x] Page loads underneath (non-blocking), so it doesn't hurt speed or SEO
- [x] Skip it on repeat visits (`sessionStorage`)
- [x] Reduced motion: quick fade instead

## 27. Photo particles (About section)
- [ ] Reference: https://tympanus.net/codrops/2019/01/17/interactive-particles-with-three-js/
- [ ] **[Abhiram to provide]** iPhone photo of myself:
  - plain or dark background (Portrait mode helps)
  - good, even light on the face (particles follow brightness)
  - head + shoulders, roughly square
  - full resolution, original file (not a screenshot)
- [ ] Remove the background if needed
- [ ] Sample the photo's pixels and place a particle wherever it's bright
- [ ] Cursor pushes particles away; they drift back to re-form the face
- [ ] Place it in the About section (task 20)
- [ ] Lazy-load it only when About scrolls into view
- [ ] Mobile: fewer particles, or touch to scatter
- [ ] Fallback: plain photo if WebGL isn't available

## 28. Sky / background upgrades
- [x] Floating box (Hubtown-style): sealed `node_modules` box floats and slowly turns in the hero sky, drops onto the grid at projects (ties into task 24)
- [x] Reference: https://www.awwwards.com/sites/hubtown
- [x] ~~Bayer dither sky~~ — tried and removed (dots read as jitter over the grid)
- [ ] Find a replacement idea for the empty sky above the grid
- [x] Wave grid: waves ripple across the grid
- [x] Reference: https://tympanus.net/codrops/2026/07/09/building-an-interactive-wave-propagation-cube-grid-with-three-js/
- [x] Decide how the three combine (e.g. dither sky + wave grid floor + box) without getting too busy
- [x] Keep it all inside the lazy-loaded `SpaceTimeGrid` scene

## 29. Personal 3D objects (guitar, mug, keycaps)
- [ ] Guitar: keep looking for a model — **[Abhiram to approve]** before anything is downloaded
- [ ] Check the guitar's license (CC0 / CC-BY only, no non-commercial) and credit it if needed
- [ ] Compress the guitar (Draco/Meshopt) so it stays small
- [ ] Build keycaps in code (rounded box, dished top) with Fira Code legends: `$`, `git`, `npm`, `⌘`, `esc`, `vim`
- [ ] Build the coffee mug in code (lathe body + handle), optional steam
- [ ] Use the same lighting/material style as the `node_modules` box
- [ ] Decide where they live (hero sky with the box, physics pile, or a section of their own)
- [ ] Lazy-load and skip on mobile / reduced motion

## 30. GitHub contributions on the spacetime grid
- [ ] Build-time script: read the public `github.com/users/AbhiramKrishnaM/contributions` page (no token) → `src/data/contributions.json`
- [ ] Re-run it on every build/deploy so the data stays fresh
- [ ] Map days onto grid cells (weeks → columns, weekdays → rows) in one section
- [ ] Glow intensity by contribution level (none / low / mid / high) in the mint accent
- [ ] Twinkle: each lit cell dims briefly on its own random cycle (13–21s, random offset), like product.inc
- [ ] Label: "N contributions since …" + link to GitHub
- [ ] Reference: https://www.product.inc/#code (`contribution-pulse` effect)
- [ ] Fallback on mobile / reduced motion: flat 2D calendar, no twinkle

## 31. Experience as a hologram story (Eddy-style)
- [x] Reference: https://eddy-naboulet.dev/profile ("How I work" section)
- [x] Replace the Experience card list with a pinned section (~1 screen of scroll per chapter)
- [x] Hologram on the left (glowing wireframe, mint/teal), text panel on the right
- [x] One scene per chapter (Eddy-style): beats build up inside a chapter; at the chapter change the scene shatters (pieces fly apart + particle burst) and the next one assembles
- [x] Hologram alternates sides each chapter (right / left), text panel swaps to the opposite side and fades through the transition
- [x] `node_modules` box is the recurring character, with a leader-line label
- [x] Leader-line labels pinned to 3D points (re-projected every frame)
- [x] Progress dots at the bottom
- [x] Prologue — college 3rd year → COVID: empty board + box, first browser frame (`HTML · CSS · JS`), ring of book tiles (`2020 / lockdown: learning everything`)
- [x] 01 Neolen (Mobile App Developer, intern, 6 mos): phone rises → app screens + React atom (`REACT NATIVE`) → cricket app, pick your XI (`10K+ DOWNLOADS`)
- [x] Interlude: book ring returns (`gap / leveling up`)
- [x] 02 Caprimul (Jr Fullstack, 4 mos): browser + server blocks linked by packets (`NUXT.JS` / `NODE.JS`) → two shipped apps (`MODERN ELECTRICALS`, `JAMBOREE`)
- [x] 03 IOCOD (Frontend Engineer, 1 yr 4 mos): marketplace storefront panels (`MERCHANT MARKETPLACE`) → `600+ US USERS` → pipeline conveyor + server splits into microservices + AWS cloud
- [x] 04 Discern (Fullstack, present): several product blocks merge into one platform (`ONE PLATFORM`) → security shield dome + radar sweep → AWS shapes (`ECS · GLUE · REDSHIFT · DYNAMODB`), box label `ABHIRAM / fullstack engineer · now`
- [x] Ending: camera pulls back to show the whole board; box packs and heads to Contact (replaces the current conveyor packing during Experience)
- [x] Mobile / reduced motion: plain vertical timeline (current cards), no hologram
- [x] Colour: mint/teal (site accent)
