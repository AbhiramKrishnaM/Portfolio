/**
 * Content for the terminal's hidden commands (fortune, cowsay, sl).
 * They're deliberately left out of `help` and tab completion — see useCLI.js.
 */

// ─── fortune ───────────────────────────────────────────────────────────────────
export const FORTUNES = [
  "There are only two hard things in computer science: cache invalidation and naming things. — Phil Karlton",
  "Talk is cheap. Show me the code. — Linus Torvalds",
  "Simplicity is prerequisite for reliability. — Edsger W. Dijkstra",
  "Programs must be written for people to read, and only incidentally for machines to execute. — Harold Abelson",
  "First, solve the problem. Then, write the code. — John Johnson",
  "It works on my machine. — every developer, ever",
  "Why do programmers prefer dark mode? Because light attracts bugs. (there's a theme toggle hidden in the name up top)",
  "A SQL query walks into a bar, walks up to two tables and asks: \"can I join you?\"",
  "There are 10 kinds of people: those who understand binary and those who don't.",
  "99 little bugs in the code. Take one down, patch it around. 127 little bugs in the code.",
  "Weeks of coding can save you hours of planning.",
  "The hardest part of any project is still centering a div.",
  "git commit -m \"final fix\" && git commit -m \"final fix (for real)\"",
  "It's not a bug, it's an undocumented feature.",
  "// TODO: write a better fortune",
];

let _lastFortune = -1;

/** Random fortune, never the same one twice in a row. */
export function randomFortune() {
  let idx;
  do {
    idx = Math.floor(Math.random() * FORTUNES.length);
  } while (idx === _lastFortune && FORTUNES.length > 1);
  _lastFortune = idx;
  return FORTUNES[idx];
}

// ─── cowsay ────────────────────────────────────────────────────────────────────
const COW = [
  "        \\   ^__^",
  "         \\  (oo)\\_______",
  "            (__)\\       )\\/\\",
  "                ||----w |",
  "                ||     ||",
];

/** Greedy word-wrap; words longer than `width` are hard-split. */
function wrap(text, width) {
  const out = [];
  let line = "";
  for (let word of text.split(/\s+/)) {
    while (word.length > width) {
      if (line) { out.push(line); line = ""; }
      out.push(word.slice(0, width));
      word = word.slice(width);
    }
    if (!word) continue;
    if (!line) line = word;
    else if (line.length + 1 + word.length <= width) line += " " + word;
    else { out.push(line); line = word; }
  }
  if (line) out.push(line);
  return out;
}

/** Returns the cow + speech bubble as a single multi-line string. */
export function cowsay(text, maxWidth = 40) {
  const rows = wrap(text, Math.max(10, maxWidth));
  const width = Math.max(...rows.map((r) => r.length));
  const pad = (r) => r.padEnd(width, " ");

  let bubble;
  if (rows.length === 1) {
    bubble = [`< ${pad(rows[0])} >`];
  } else {
    bubble = rows.map((r, i) => {
      const [l, rt] = i === 0 ? ["/", "\\"] : i === rows.length - 1 ? ["\\", "/"] : ["|", "|"];
      return `${l} ${pad(r)} ${rt}`;
    });
  }

  return [
    ` ${"_".repeat(width + 2)}`,
    ...bubble,
    ` ${"-".repeat(width + 2)}`,
    ...COW,
  ].join("\n");
}

// ─── sl ────────────────────────────────────────────────────────────────────────
// Two frames so the smoke puffs and the wheels turn as it drives.
export const TRAIN_FRAMES = [
  [
    "      ( ) (@@) ( )  (@)  ()",
    "    (@@)",
    "   ____    __________   __________",
    "  _|[]|___|  abhi    |-|  .dev    |",
    " |________|__________| |__________|",
    "  (o)--(o)   (o)  (o)   (o)  (o)",
  ],
  [
    "      (@@) ( ) (@)  ( )  @@",
    "    ( )",
    "   ____    __________   __________",
    "  _|[]|___|  abhi    |-|  .dev    |",
    " |________|__________| |__________|",
    "  (O)--(O)   (O)  (O)   (O)  (O)",
  ],
];

export const TRAIN_WIDTH = Math.max(...TRAIN_FRAMES.flat().map((l) => l.length));

/** One frame of the train shifted to `offset` columns (negative = off the left edge). */
export function trainFrame(frameIdx, offset) {
  return TRAIN_FRAMES[frameIdx % TRAIN_FRAMES.length]
    .map((l) => (offset >= 0 ? " ".repeat(offset) + l : l.slice(-offset)))
    .join("\n");
}
