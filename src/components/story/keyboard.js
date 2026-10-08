import {
  BoxGeometry,
  CanvasTexture,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  SRGBColorSpace,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";

const MODEL_URL = "/models/keyboard.glb";
const MODEL_CENTER = [3.85, 0, -14];
const MODEL_WIDTH = 31;
const CASE_NODE = "Cube.062";
const PLATE_NODE = "Cube.040";

const ROWS = [
  ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "Backspace"],
  ["Tab", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\"],
  ["CapsLock", "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'", "Enter"],
  ["Shift", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/", "ShiftRight"],
  ["Control", "Alt", " ", "AltRight", "Meta", "Fn", "ControlRight"],
];
const ACCENT_KEYS = new Set(["`", "Enter", " "]);
const SHIFTED = {
  "~": "`", "!": "1", "@": "2", "#": "3", "$": "4", "%": "5", "^": "6", "&": "7", "*": "8", "(": "9", ")": "0",
  "_": "-", "+": "=", "{": "[", "}": "]", "|": "\\", ":": ";", "\"": "'", "<": ",", ">": ".", "?": "/",
};

const PRESS_DEPTH = 0.5;
const PRESS_DECAY = 9;
const SCREEN_CHARS = 26;
const IDLE_AFTER_S = 6;
const IDLE_TYPE_S = 0.11;
const IDLE_PHRASES = ["npm run dev", "git push origin main", "hello, world", "sudo make coffee", "ls node_modules", "vim portfolio.vue"];
const SCATTER_PX = 160;

const smooth = (t) => t * t * (3 - 2 * t);

function drawScreen(ctx, text, cursorOn, colors, flash) {
  const { width: w, height: h } = ctx.canvas;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = colors.screen;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = colors.accent;
  ctx.globalAlpha = 0.5 + flash * 0.5;
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, w - 6, h - 6);
  ctx.globalAlpha = 1;
  ctx.font = `500 ${h * 0.46}px "Fira Code", monospace`;
  ctx.textBaseline = "middle";
  ctx.fillStyle = colors.accent;
  ctx.fillText("$", w * 0.035, h * 0.52);
  ctx.fillStyle = colors.text;
  const shown = text.slice(-SCREEN_CHARS);
  ctx.fillText(shown, w * 0.1, h * 0.52);
  if (cursorOn) {
    const x = w * 0.1 + ctx.measureText(shown).width + 4;
    ctx.fillStyle = colors.accent;
    ctx.fillRect(x, h * 0.28, h * 0.22, h * 0.48);
  }
}

export function createKeyboard(colors) {
  const group = new Group();
  const pivot = new Group();
  group.add(pivot);
  group.visible = false;

  const materials = {
    key: new MeshStandardMaterial({ roughness: 0.6, metalness: 0.05 }),
    accent: new MeshStandardMaterial({ roughness: 0.55, metalness: 0.05 }),
    case: new MeshStandardMaterial({ roughness: 0.5, metalness: 0.2 }),
  };
  const keys = new Map();
  const pressable = [];
  let ready = false;

  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 160;
  const ctx = canvas.getContext("2d");
  const screenTexture = new CanvasTexture(canvas);
  screenTexture.colorSpace = SRGBColorSpace;
  const screen = new Group();
  const bezel = new Mesh(new BoxGeometry(22.6, 3.9, 0.6), materials.case);
  const panel = new Mesh(new PlaneGeometry(21.6, 3.375), new MeshBasicMaterial({ map: screenTexture }));
  panel.position.z = 0.31;
  const stand = new Mesh(new BoxGeometry(6, 2.2, 0.5), materials.case);
  stand.position.set(0, -2.2, -0.15);
  screen.add(bezel, panel, stand);
  screen.position.set(0, 4.4, -7.2);
  screen.rotation.x = -0.18;
  pivot.add(screen);

  let text = "";
  let lastKeyAt = -Infinity;
  let flashAt = -Infinity;
  let dirty = true;
  let lastCursor = null;
  let idle = null;
  let pendingClear = null;
  let palette = { ...colors };

  function applyColors(next) {
    palette = { ...palette, ...next };
    materials.key.color.set(palette.key);
    materials.accent.color.set(palette.accent);
    materials.case.color.set(palette.case);
    dirty = true;
  }
  applyColors(colors);

  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  loader.load(MODEL_URL, (gltf) => {
    const model = gltf.scene;
    model.rotation.y = -Math.PI / 2;
    model.position.set(MODEL_CENTER[2], 0, -MODEL_CENTER[0]);
    const rows = new Map();
    const paint = (node, material) => node.traverse((child) => {
      if (child.isMesh) child.material = material;
    });
    model.children.forEach((node) => {
      if (node.name === CASE_NODE || node.name === PLATE_NODE) {
        paint(node, materials.case);
        return;
      }
      const row = Math.round(node.position.x / 2);
      if (!rows.has(row)) rows.set(row, []);
      rows.get(row).push(node);
    });
    [...rows.keys()].sort((a, b) => a - b).forEach((row, r) => {
      const nodes = rows.get(row).sort((a, b) => b.position.z - a.position.z);
      nodes.forEach((node, c) => {
        const label = ROWS[r]?.[c];
        paint(node, ACCENT_KEYS.has(label) ? materials.accent : materials.key);
        const entry = { node, restY: node.position.y, press: 0 };
        pressable.push(entry);
        if (label) keys.set(label, entry);
      });
    });
    pivot.add(model);
    ready = true;
  });

  function pressKey(label) {
    const entry = keys.get(label);
    if (entry) entry.press = 1;
  }

  function press(key, time) {
    lastKeyAt = time;
    if (key === "Enter") {
      pressKey("Enter");
      flashAt = time;
      pendingClear = time + 0.6;
    } else if (key === "Backspace") {
      pressKey("Backspace");
      text = text.slice(0, -1);
    } else if (key.length === 1) {
      if (pendingClear !== null) {
        text = "";
        pendingClear = null;
      }
      const lower = key.toLowerCase();
      if (SHIFTED[key]) {
        pressKey("Shift");
        pressKey(SHIFTED[key]);
      } else {
        if (key !== lower) pressKey("Shift");
        pressKey(lower);
      }
      text += key;
    } else {
      pressKey(key);
    }
    dirty = true;
  }

  function stepIdle(time) {
    if (time - lastKeyAt < IDLE_AFTER_S && !idle) return;
    if (!idle) {
      idle = { phrase: IDLE_PHRASES[Math.floor(Math.random() * IDLE_PHRASES.length)], i: 0, next: time };
      if (pendingClear === null) text = "";
    }
    if (time < idle.next) return;
    if (idle.i < idle.phrase.length) {
      press(idle.phrase[idle.i], time);
      idle.i += 1;
      idle.next = time + IDLE_TYPE_S * (0.6 + Math.random() * 0.9);
    } else {
      press("Enter", time);
      idle = null;
      lastKeyAt = time - IDLE_AFTER_S + 2.5;
    }
  }

  function external(key, time) {
    idle = null;
    press(key, time);
  }

  function update({ x, y, width, vw, vh, time, dt, scatter }) {
    const fade = 1 - smooth(Math.min(1, scatter * 1.4));
    group.visible = ready && fade > 0.01;
    if (!group.visible) return;
    stepIdle(time);
    if (pendingClear !== null && time >= pendingClear) {
      text = "";
      pendingClear = null;
      dirty = true;
    }
    pressable.forEach((entry) => {
      entry.press = Math.max(0, entry.press - dt * PRESS_DECAY);
      entry.node.position.y = entry.restY - PRESS_DEPTH * smooth(entry.press);
    });
    const cursorOn = Math.floor(time * 2) % 2 === 0;
    const flash = Math.max(0, 1 - (time - flashAt) / 0.4);
    if (dirty || cursorOn !== lastCursor || flash > 0) {
      drawScreen(ctx, text, cursorOn, palette, flash);
      screenTexture.needsUpdate = true;
      dirty = false;
      lastCursor = cursorOn;
    }
    const push = scatter * SCATTER_PX;
    group.position.set(x - push - vw / 2, vh / 2 - (y + Math.sin(time * 0.9) * 5) + push * 0.3, 0);
    group.scale.setScalar((width / MODEL_WIDTH) * fade);
    group.rotation.set(0.72 + Math.sin(time * 0.5) * 0.03, -0.32 + Math.sin(time * 0.35) * 0.05, 0.04);
  }

  function dispose() {
    Object.values(materials).forEach((m) => m.dispose());
    screenTexture.dispose();
    panel.material.dispose();
    panel.geometry.dispose();
    bezel.geometry.dispose();
    stand.geometry.dispose();
    group.traverse((obj) => {
      if (obj.isMesh && obj.geometry) obj.geometry.dispose();
    });
  }

  return { group, update, external, setColors: applyColors, dispose };
}
