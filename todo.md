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
- [ ] Add a `now` command: currently building / learning / listening to
- [ ] Start with static text in a composable
- [ ] Later: pull "listening to" from the Spotify API

## 9. Easter eggs
- [ ] Konami code (↑↑↓↓←→←→BA) triggers chaos mode / confetti
- [ ] Achievements: unlock badges for trying commands, finishing a game, finding secrets
- [ ] Show a small toast in the corner when one unlocks
- [ ] Save unlocked achievements in `localStorage`
- [ ] `achievements` command lists unlocked / locked ones

// version 2 next week updates
## 10. Gravity well in the spacetime grid
- [ ] Pass the cursor position into `SpaceTimeGrid.vue` (as a shader uniform)
- [ ] Bend the grid down around the cursor like a mass warping space
- [ ] Add a second, heavier "mass" that follows the terminal while it flies down
- [ ] Ease the warp in/out so it feels smooth, not jumpy
- [ ] Turn it off on touch devices / low-power mode

## 11. Scroll-driven camera flight
- [ ] Decide a camera position for each section (hero, projects, …)
- [ ] Move the grid camera between them with a GSAP ScrollTrigger
- [ ] Sync it with the existing terminal motion path so both move together
- [ ] Keep the page usable on mobile (simpler or no camera move)

## 12. WebGL hover effect on project images
- [ ] Pick the effect (liquid warp or RGB split)
- [ ] Render the project card image on a WebGL plane/canvas
- [ ] Animate the effect on hover, ease back on leave
- [ ] Fall back to a plain image if WebGL isn't available

## 13. Glass refraction on the hero name
- [ ] Prototype the glass/refraction effect on the name text
- [ ] Make the distortion follow the cursor
- [ ] Keep the real `h1` text in the DOM for SEO and screen readers
- [ ] Make sure the theme-toggle "h" still works

## 14. Tech stack physics pile
- [ ] Pick the engine (Matter.js for 2D or Rapier for 3D)
- [ ] Make tech logos (Vue, React, Node, Python, Docker, AWS) physics bodies
- [ ] Drop them in when the section scrolls into view
- [ ] Let people grab and throw them with the mouse
- [ ] Lazy-load the physics engine so it doesn't slow the landing page

## 15. Day/night mode from local time
- [ ] Read the visitor's local time
- [ ] Define looks for dawn / day / dusk / night (grid color, glow, background)
- [ ] Blend smoothly between them
- [ ] Theme toggle still overrides it manually

## 16. Remove code comments
- [ ] Remove comments from all files in `src/`
- [ ] List any comment that seems truly needed and get approval before keeping it
- [ ] Run `npx eslint src/` and `npm run build` after to make sure nothing broke
- [ ] Rule going forward: no comments in new code unless approved
