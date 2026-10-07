### My Personal Portfolio website

This is my personal portfolio website showcasing my projects, skills, and experience as a developer. Built with modern web technologies, this site serves as a comprehensive representation of my work and professional journey.

## About Me

I'm Abhiram Krishna M, a software engineer from Kozhikode, Kerala, India. I'm passionate about building user friendly interfaces and have experience working with various JavaScript frameworks including React, Vue.js, and Nuxt.js. Throughout my career, I've worked with startups like Neolen, Caprimul Technologies, IOCOD Infotech, and currently at Discern Security, where I continue to expand my expertise in frontend development, backend integration, and modern web technologies.

## Features

- **Interactive terminal** - The landing page is a working terminal: `help`, `whoami`, `projects`, `now`, `git log` (live GitHub commits), `achievements`, and a few hidden commands to discover
- **Scroll-docked projects** - Scrolling moves the terminal into a projects section, types `$ projects`, and shows a preview card for whichever project you hover
- **Experience, About & Contact** - A timeline, an About write-up, and a contact section with copy-email; each also has a terminal command (`experience`, `cat about.txt`, `contact`, `resume`)
- **Mini-games** - Snake, Sudoku, and Tetris, launched from the terminal (`/game`) or the command palette
- **Command palette** - `⌘/Ctrl + K` to jump to projects, open socials, start a game, or switch theme
- **Achievements & easter eggs** - Unlockable badges with toasts, saved in `localStorage`, plus a Konami-code chaos mode
- **Light / dark theme** - Toggle by clicking the "h" in the name
- **Responsive & accessible** - Works from phone to wide desktop, respects reduced-motion, keyboard-friendly

## Tech Stack

- **Vue.js 3** - Progressive JavaScript framework
- **Vue Router** - Official router for Vue.js
- **Vite** - Next-generation frontend build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Three.js** - 3D graphics library
- **GSAP** - Animation library for JavaScript
- **PostCSS** - CSS processing tool

## Getting Started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npx eslint src/  # lint
```

## Project Structure

```
src/
  pages/         one file per route (index.vue = landing page)
  components/    app/ (global overlays), hero/, sections/ (experience, about, contact, footer), cli/ (terminal UI), games/, projects/, background/
  composables/   behaviour + state (useX.js); composables/cli/ is the terminal engine
  data/          hand-edited content: profile, projects, experience, about, socials, games, now
```

To change copy (projects, experience, about, links, taglines, `now`), edit `src/data/`. Placeholders read "— to be added". To enable the resume download, put the PDF in `public/` and set `RESUME.url` in `src/data/profile.js`. To add a terminal command, add it to `src/composables/cli/commands.js` (or `hiddenCommands.js` for a secret one).

------

## Tickets / TODO

- [ ] Mobile friendly optimization - Improve responsive design for mobile devices
- [ ] Component optimizations - Optimize component performance and reduce bundle size
- [ ] Accessibility improvements - Add ARIA labels and improve keyboard navigation
- [ ] SEO optimization - Add meta tags, structured data, and improve SEO
- [ ] Performance optimization - Implement code splitting and lazy loading
- [ ] Error handling - Add comprehensive error boundaries and error handling
