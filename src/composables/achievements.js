import { ref, computed } from "vue";

const STORAGE_KEY = "achievements-v1";
const CURIOUS_THRESHOLD = 5;

export const SECRET_COMMANDS = ["fortune", "cowsay", "sudo", "sl", "matrix", "vim"];

export const ACHIEVEMENTS = [
  { id: "hello-world", name: "hello, world", desc: "run your first command" },
  { id: "rtfm", name: "rtfm", desc: "read the help" },
  { id: "curious", name: "curious", desc: `try ${CURIOUS_THRESHOLD} different commands` },
  { id: "portfolio", name: "portfolio peeker", desc: "check out the projects" },
  { id: "lurker", name: "lurker", desc: "read the git log" },
  { id: "theme", name: "flip the switch", desc: "change the theme" },
  { id: "power-user", name: "power user", desc: "open the command palette" },
  { id: "game-over", name: "game over", desc: "finish a round of any game" },
  { id: "sudoku", name: "number cruncher", desc: "solve a sudoku" },
  { id: "secret", name: "off the menu", desc: "run a hidden command", secret: true },
  { id: "escape-vim", name: "escape artist", desc: "get out of vim", secret: true },
  { id: "konami", name: "↑↑↓↓←→←→BA", desc: "enter the konami code", secret: true },
  { id: "egg-hunter", name: "egg hunter", desc: `find all ${SECRET_COMMANDS.length} hidden commands`, secret: true },
  { id: "completionist", name: "completionist", desc: "unlock every other achievement", secret: true },
];

const emptyState = () => ({ unlocked: {}, commands: [], secrets: [] });

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    return { ...emptyState(), ...(saved ?? {}) };
  } catch {
    return emptyState();
  }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.value));
  } catch {
    return;
  }
}

const state = ref(load());

export const toastQueue = ref([]);

export const isUnlocked = (id) => Boolean(state.value.unlocked[id]);

export const unlockedCount = computed(() => ACHIEVEMENTS.filter((a) => isUnlocked(a.id)).length);

export function unlock(id) {
  const achievement = ACHIEVEMENTS.find((a) => a.id === id);
  if (!achievement || isUnlocked(id)) return false;
  state.value.unlocked[id] = Date.now();
  toastQueue.value.push({ ...achievement, key: `${id}-${Date.now()}` });
  const othersDone = ACHIEVEMENTS.every((a) => a.id === "completionist" || isUnlocked(a.id));
  if (othersDone) unlock("completionist");
  save();
  return true;
}

export function recordCommand(name) {
  unlock("hello-world");
  if (!state.value.commands.includes(name)) {
    state.value.commands.push(name);
    save();
  }
  if (state.value.commands.length >= CURIOUS_THRESHOLD) unlock("curious");
}

export function recordSecret(name) {
  unlock("secret");
  if (!state.value.secrets.includes(name)) {
    state.value.secrets.push(name);
    save();
  }
  if (SECRET_COMMANDS.every((s) => state.value.secrets.includes(s))) unlock("egg-hunter");
}
