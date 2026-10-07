import { ref } from "vue";

export const PIN_SCREENS = 2.8;
export const STACK_START = 0.5;
export const SECTION_LINE = 0.4;
export const STACK_ANCHOR_TOP = `${(STACK_START * (PIN_SCREENS - 1) + SECTION_LINE) * 100}vh`;

export const story = {
  markers: null,
  flight: { progress: 0, el: null },
  impulses: [],
};

export function pushImpulse(x, y, strength = 1) {
  story.impulses.push({ x, y, strength });
  if (story.impulses.length > 8) story.impulses.shift();
}

export const contactRevealed = ref(true);

export const clamp01 = (v) => Math.min(1, Math.max(0, v));

export function progressBetween(scroll, start, end) {
  if (end <= start) return scroll >= end ? 1 : 0;
  return clamp01((scroll - start) / (end - start));
}

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function isDesktop() {
  return window.matchMedia("(min-width: 1024px)").matches;
}

function docTop(el) {
  return el.getBoundingClientRect().top + window.scrollY;
}

export function measureStory() {
  const ids = ["hero", "projects", "stack", "experience", "about", "contact"];
  const [hero, projects, stack, experience, about, contact] = ids.map((id) => document.getElementById(id));
  if (!hero || !projects || !stack || !experience || !about || !contact || projects.offsetParent === null) {
    story.markers = null;
    return;
  }

  const vh = window.innerHeight;
  const maxScroll = Math.max(0, document.documentElement.scrollHeight - vh);
  const projectsTop = docTop(projects);
  const pinEnd = projectsTop + projects.offsetHeight - vh;
  const contactTop = docTop(contact);

  story.markers = {
    vh,
    maxScroll,
    heroTop: docTop(hero),
    projectsTop,
    stackStart: docTop(stack) - vh * SECTION_LINE,
    pinEnd,
    experienceTop: docTop(experience),
    aboutTop: docTop(about),
    contactEnter: Math.min(contactTop - vh, maxScroll - vh * 0.35),
    contactSettle: Math.min(contactTop - vh * 0.15, maxScroll),
  };
}
