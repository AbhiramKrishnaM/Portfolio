import { social } from "@/data/socials.js";
import { randomFortune, cowsay, trainFrame, TRAIN_WIDTH } from "./easterEggs.js";

const TRAIN_FRAME_MS = 30;
const TRAIN_LABEL = "a train drives across the terminal";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function createHiddenCommands(term, scenes) {
  const { addLine, blank, addPre } = term;

  async function driveTrain() {
    const token = scenes.currentToken();
    term.booting.value = true;
    const id = addPre("", TRAIN_LABEL, "accent");
    for (let offset = term.columns.value, frame = 0; offset > -TRAIN_WIDTH; offset--, frame++) {
      await delay(TRAIN_FRAME_MS);
      if (token !== scenes.currentToken()) return;
      const text = trainFrame(Math.floor(frame / 4), offset);
      if (!term.replaceLine(id, { type: "pre", content: { text, label: TRAIN_LABEL, tone: "accent" } })) return;
    }
    term.removeLine(id);
    term.booting.value = false;
  }

  const secretCommands = {
    fortune() {
      addLine("comment", `// ${randomFortune()}`);
      blank();
    },

    sl: driveTrain,

    matrix() {
      term.overlay.value = "matrix";
    },
  };

  const openVim = () => {
    term.overlay.value = "vim";
  };

  const argCommands = {
    cowsay(text) {
      const message = text || "moo. try: cowsay <text>";
      addPre(cowsay(message, Math.min(40, term.columns.value - 8)), `a cow says: ${message}`);
      blank();
    },

    sudo(args) {
      if (args.toLowerCase() === "hire-me") {
        addLine("comment", "[sudo] password for visitor: ********");
        addLine("comment", "// access granted. excellent decision.");
        addLine("comment", "// initiating hire sequence — next step is yours:");
        ["email", "linkedin", "github"].forEach((id) => term.addLink(social(id)));
      } else {
        addLine("error", "visitor is not in the sudoers file. This incident will be reported.");
      }
      blank();
    },

    vim: openVim,
    vi: openVim,
    nvim: openVim,
  };

  return { secretCommands, argCommands, isVimAlias: (name) => argCommands[name] === openVim };
}
