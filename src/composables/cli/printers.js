import { WHOAMI } from "@/data/profile.js";
import { SOCIALS } from "@/data/socials.js";
import { PROJECTS } from "@/data/projects.js";
import { unlock } from "@/composables/achievements.js";

export const HELP_HINT = "// type \"help\" to see available commands";

export function printWhoami(term) {
  WHOAMI.forEach((pair) => term.addLine("pair", pair));
  term.blank();
}

export function printSocials(term) {
  term.addLine("comment", "// socials");
  SOCIALS.forEach(term.addLink);
  term.blank();
}

export function printProjects(term) {
  unlock("portfolio");
  term.addLine("comment", "// projects");
  PROJECTS.forEach((project) => term.addLine("project-row", project));
  term.blank();
}
