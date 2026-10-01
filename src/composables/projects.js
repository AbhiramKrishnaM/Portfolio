/**
 * Projects shown by the terminal's `projects` command, the scroll-driven
 * projects scene on the landing page, and the ProjectCard beside it.
 *
 * To add a project: append an entry below.
 *   name   display name (terminal list + card)
 *   slug   short id, shown on the card as `// _slug`
 *   desc   one-line description
 *   url    GitHub repo
 *   demo   optional live site — the card's view-project button prefers it
 *   tech   keys of TECH below, first one is the card's main badge
 *   image  optional preview screenshot path (e.g. "/projects/findmyjob.png" in
 *          public/); null shows a placeholder
 */

import { siAstro, siDocker, siPython, siTypescript } from "simple-icons";

// Brand icons from simple-icons (CC0), rendered in the theme's accent color.
export const TECH = {
  python: siPython,
  astro: siAstro,
  docker: siDocker,
  typescript: siTypescript,
};

export const PROJECTS = [
  {
    name: "Job Search",
    slug: "findmyjob",
    desc: "crawls the web and finds relevant job postings based on your prompts",
    url: "https://github.com/AbhiramKrishnaM/findmyjob",
    demo: null,
    tech: ["python"],
    image: null,
  },
  {
    name: "aidev",
    slug: "powercli",
    desc: "AI-powered CLI assistant for developers",
    url: "https://github.com/AbhiramKrishnaM/powercli",
    demo: "https://aidev-omega.vercel.app",
    tech: ["python", "astro"],
    image: null,
  },
  {
    name: "My Kali",
    slug: "my-kali",
    desc: "personal kali linux container",
    url: "https://github.com/AbhiramKrishnaM/My-Kali",
    demo: null,
    tech: ["docker"],
    image: null,
  },
  {
    name: "Guitar Pro 1",
    slug: "guitar-pro-1",
    desc: "application to build guitar chord progressions",
    url: "https://github.com/AbhiramKrishnaM/Guitar-Pro-1",
    demo: "https://guitar-pro-1.vercel.app",
    tech: ["typescript"],
    image: null,
  },
];
