import { WHOAMI } from "@/data/profile.js";
import { SOCIALS } from "@/data/socials.js";
import { PROJECTS } from "@/data/projects.js";
import { STACK } from "@/data/stack.js";
import { unlock } from "@/composables/achievements.js";

export const HELP_HINT = "// type \"help\" to see available commands";

export function printWhoami(term) {
  WHOAMI.forEach((pair) => term.addLine("pair", pair));
  term.blank();
}

export const STACK_LINE = STACK.map((item) => item.id).join("  ");

export function printStack(term) {
  term.addLine("comment", "// node_modules");
  term.addLine("text", STACK_LINE);
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
