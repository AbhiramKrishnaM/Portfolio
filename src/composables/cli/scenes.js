import { WHOAMI } from "@/data/profile.js";
import { SOCIALS } from "@/data/socials.js";
import { PROJECTS } from "@/data/projects.js";
import { nextLineId } from "./terminalState.js";
import { printWhoami, printSocials, STACK_LINE, HELP_HINT } from "./printers.js";

const TYPE_DELAY_MS = 55;
const AFTER_TYPING_MS = 220;
const SCENE_CANCELLED = Symbol("scene-cancelled");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let hasBootedOnce = false;

async function introScene(term, { wait, typeCommand }) {
  await typeCommand("whoami");
  for (const pair of WHOAMI) {
    term.addLine("pair", pair);
    await wait(70);
  }
  term.blank();
  await wait(180);

  await typeCommand("ls socials");
  term.addLine("comment", "// socials");
  await wait(70);
  for (const link of SOCIALS) {
    term.addLink(link);
    await wait(70);
  }
  term.blank();
  await wait(150);

  term.addLine("comment", HELP_HINT);
  term.blank();
}

async function projectsScene(term, { wait, typeCommand }) {
  await typeCommand("projects");
  term.addLine("comment", "// projects");
  for (const project of PROJECTS) {
    await wait(140);
    term.addLine("project-row", project);
  }
  await wait(140);
  term.blank();
  term.addLine("comment", HELP_HINT);
  term.blank();
}

async function stackScene(term, { wait, typeCommand }) {
  await typeCommand("ls stack");
  term.addLine("comment", "// node_modules");
  await wait(160);
  term.addLine("text", STACK_LINE);
  await wait(200);
  term.blank();
  term.addLine("comment", "// unpacking node_modules →");
  term.blank();
}

const SCENES = { intro: introScene, projects: projectsScene, stack: stackScene };

export function createScenes(term) {
  let sceneToken = 0;
  let currentScene = null;

  function printIntroInstantly() {
    term.addLine("input", "whoami");
    printWhoami(term);
    term.addLine("input", "ls socials");
    printSocials(term);
    term.addLine("comment", HELP_HINT);
    term.blank();
  }

  async function playScene(name) {
    const token = ++sceneToken;
    currentScene = name;
    term.lines.value = [];
    term.menuState.value = null;
    term.overlay.value = null;
    term.booting.value = true;

    const wait = async (ms) => {
      await delay(ms);
      if (token !== sceneToken) throw SCENE_CANCELLED;
    };

    async function typeCommand(cmd) {
      const lineId = nextLineId();
      term.lines.value.push({ id: lineId, type: "input", content: "", cursor: true });
      for (let i = 0; i <= cmd.length; i++) {
        await wait(TYPE_DELAY_MS);
        term.replaceLine(lineId, { type: "input", content: cmd.slice(0, i), cursor: i < cmd.length });
      }
      await wait(AFTER_TYPING_MS);
    }

    try {
      await SCENES[name](term, { wait, typeCommand });
    } catch (err) {
      if (err !== SCENE_CANCELLED) throw err;
      return false;
    }
    term.booting.value = false;
    return true;
  }

  function showScene(name) {
    if (name === currentScene) return Promise.resolve(false);
    return playScene(name);
  }

  async function bootAnimated() {
    if (hasBootedOnce) {
      sceneToken++;
      currentScene = "intro";
      printIntroInstantly();
      return true;
    }
    hasBootedOnce = true;
    return playScene("intro");
  }

  function resetToIntro() {
    currentScene = "intro";
    printIntroInstantly();
  }

  return {
    playScene,
    showScene,
    bootAnimated,
    resetToIntro,
    currentToken: () => sceneToken,
  };
}
