import { siAstro, siDocker, siPython, siTypescript } from "simple-icons";

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
