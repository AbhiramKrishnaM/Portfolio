# TODO — this week

## 1. More space between navbar and terminal on scroll
- [ ] Check where the terminal lands after scrolling (the dock in section 2 of `index.vue`)
- [ ] Add top margin/padding to the dock so it sits lower under the navbar
- [ ] Check it on lg, xl, and 2xl screens

## 2. Terminal switches to `$ projects` on scroll
- [ ] Add a projects data list (name, short description, link)
- [ ] Add a `projects` command in `useCLI.js` that prints the list
- [ ] Add a way to clear the intro and type `projects` with the existing typing animation
- [ ] Show projects one by one (small delay between each)
- [ ] Trigger it with a ScrollTrigger when the terminal reaches the projects section
- [ ] Scrolling back up restores the intro (`whoami` + `ls socials`)
- [ ] Fast up/down scrolling shouldn't jumble the typing animation
- [ ] Don't switch to projects while a game is being played
- [ ] Add `projects` to the `help` list

## 3. Projects link in navbar
- [ ] Add a Projects entry to `navLinks.js`
- [ ] Clicking it scrolls smoothly to the projects section
- [ ] Highlight the link while the projects section is in view

## 4. Project preview card next to the terminal
- [ ] Build a `ProjectCard` component (label `Project N // _slug`, preview image, tech icon badge, description, `view-project` button)
- [ ] Add placeholder data for each project (image, slug, description, tech, link)
- [ ] Place the card in the empty space right of the docked terminal
- [ ] Keep it hidden on the hero; fade it in only once the terminal lands on the projects section
- [ ] Hide it again when scrolling back up
- [ ] Show the first project by default
- [ ] Hovering/clicking a project in the terminal list swaps the card to that project
- [ ] Smooth transition when the card swaps
- [ ] On mobile, show the card below the terminal
